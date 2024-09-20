const getTaskData = require("./helpers/getTaskData");

async function main() {
    const taskData = await getTaskData('DLfP5RCAdYiirmn8cigptQusg8ds75JzFXSrHc8ydyeu', 0);
    console.log(taskData);
}

main();