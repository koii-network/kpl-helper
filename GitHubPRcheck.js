const axios = require('axios');
const fs = require('fs').promises;
const getStakingAccountInfo = require("./helpers/getStakingAccountInfo");
require("dotenv").config();

const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const TOKEN = process.env.GITHUB_TOKEN;

const START_DATE = '2025-02-14T00:00:00Z';
const END_DATE = '2025-02-20T23:59:59Z';

async function fetchPRs(page = 1) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=open&per_page=100&page=${page}`;
    const headers = { Authorization: `Bearer ${TOKEN}` };

    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching PRs:', error.response?.data || error.message);
        return [];
    }
}

async function getAllPRs() {
    let allPRs = [];
    let page = 1;
    while (true) {
        const prs = await fetchPRs(page);
        if (prs.length === 0) break;
        allPRs.push(...prs);
        page++;
    }
    return allPRs;
}

async function getStakingKeys() {
    try {
        const data = await fs.readFile('./builder247.todos.json', 'utf8');
        const todos = JSON.parse(data);
        
        const stakingKeyMap = new Map();
        
        todos.forEach(todo => {
            if (todo.assignedTo && Array.isArray(todo.assignedTo)) {
                todo.assignedTo.forEach(assignment => {
                    if (assignment.githubUsername && assignment.stakingKey) {
                        stakingKeyMap.set(assignment.githubUsername.toLowerCase(), {
                            stakingKey: assignment.stakingKey,
                            pubKey: null // Will be populated later
                        });
                    }
                });
            }
        });

        // Get pubKeys for all staking keys
        for (const [username, data] of stakingKeyMap.entries()) {
            try {
                const accountInfo = await getStakingAccountInfo(data.stakingKey);
                // console.log(accountInfo);
                data.pubKey = accountInfo || 'Not Found';
            } catch (error) {
                console.error(`Error getting pubKey for ${username}:`, error.message);
                data.pubKey = 'Error';
            }
        }
        
        console.log(`Found ${stakingKeyMap.size} GitHub username to staking key mappings`);
        return stakingKeyMap;
    } catch (error) {
        console.error('Error reading todos file:', error);
        throw error;
    }
}

async function filterAndAnalyzePRs() {
    const [allPRs, stakingKeyMap] = await Promise.all([
        getAllPRs(),
        getStakingKeys()
    ]);
    
    // Filter PRs by date range
    const filteredPRs = allPRs.filter(pr => {
        const createdAt = new Date(pr.created_at);
        const startDate = new Date(START_DATE);
        const endDate = new Date(END_DATE);
        return createdAt >= startDate && createdAt <= endDate;
    });

    // Group PRs by user and date, and count total PRs per user
    const userPRsByDate = {};
    const userPRCount = {};
    
    filteredPRs.forEach(pr => {
        const user = pr.user.login.toLowerCase(); // Convert username to lowercase
        const date = new Date(pr.created_at).toISOString().split('T')[0];

        // Track dates
        if (!userPRsByDate[user]) {
            userPRsByDate[user] = new Set();
        }
        userPRsByDate[user].add(date);

        // Count total PRs
        userPRCount[user] = (userPRCount[user] || 0) + 1;
    });

    // Generate array of dates between START_DATE and END_DATE
    const requiredDates = [];
    let currentDate = new Date(START_DATE);
    const endDate = new Date(END_DATE);
    
    while (currentDate <= endDate) {
        requiredDates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Modify user mapping to include staking key and pubKey
    const allUsers = Object.entries(userPRsByDate).map(([user, dates]) => {
        const prCount = userPRCount[user];
        const koiiReward = prCount >= 10 ? 8000 : prCount * 800;
        const stakingInfo = stakingKeyMap.get(user) || { stakingKey: 'Not Found', pubKey: 'Not Found' };
        
        return {
            username: user,
            originalUsername: allPRs.find(pr => pr.user.login.toLowerCase() === user)?.user.login || user,
            stakingKey: stakingInfo.stakingKey,
            pubKey: stakingInfo.pubKey,
            totalPRs: prCount,
            dates: Array.from(dates),
            isQualified: requiredDates.every(date => dates.has(date)) && prCount >= 2,
            koiiReward: koiiReward
        };
    });

    // Calculate total KOII rewards
    const totalKoiiRewards = allUsers.reduce((sum, user) => sum + user.koiiReward, 0);

    console.log('Total PRs in date range:', filteredPRs.length);
    console.log('Total unique users:', allUsers.length);
    console.log('Qualified users:', allUsers.filter(user => user.isQualified).length);
    console.log('\nDetailed user information:');
    
    allUsers
        .sort((a, b) => b.totalPRs - a.totalPRs) // Sort by number of PRs (highest first)
        .forEach(user => {
            // console.log(`\nUsername: ${user.username}`);
            // console.log(`Total PRs: ${user.totalPRs}`);
            // console.log(`Dates with PRs: ${user.dates.join(', ')}`);
            // console.log(`Qualified: ${user.isQualified}`);
        });

    // Modify summary to include users without staking keys or pubKeys
    const usersWithoutStakingKeys = allUsers
        .filter(user => user.stakingKey === 'Not Found')
        .map(user => user.username);

    const usersWithoutPubKeys = allUsers
        .filter(user => user.pubKey === 'Not Found' || user.pubKey === 'Error')
        .map(user => user.username);

    const summary = {
        totalPRs: filteredPRs.length,
        totalUsers: allUsers.length,
        qualifiedUsers: allUsers.filter(user => user.isQualified).length,
        totalKoiiRewards,
        usersWithoutStakingKeys,
        usersWithoutPubKeys,
        users: allUsers.sort((a, b) => b.totalPRs - a.totalPRs)
    };

    // Write to file
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `pr-analysis-${timestamp}.json`;
        await fs.writeFile(fileName, JSON.stringify(summary, null, 2));
        console.log(`Analysis written to ${fileName}`);
        
        // Print brief summary to console
        console.log('\nQuick Summary:');
        console.log(`Total PRs: ${summary.totalPRs}`);
        console.log(`Total Users: ${summary.totalUsers}`);
        console.log(`Qualified Users: ${summary.qualifiedUsers}`);
        console.log(`Total KOII Rewards: ${summary.totalKoiiRewards} KOII`);

        // Add warning about users without staking keys or pubKeys
        if (usersWithoutStakingKeys.length > 0) {
            console.log('\nWarning: Some users do not have staking keys:');
            console.log(usersWithoutStakingKeys.join(', '));
        }

        if (usersWithoutPubKeys.length > 0) {
            console.log('\nWarning: Some users do not have valid pubKeys:');
            console.log(usersWithoutPubKeys.join(', '));
        }
    } catch (error) {
        console.error('Error writing to file:', error);
    }
}

filterAndAnalyzePRs();
