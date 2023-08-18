(() => {
    const action = new PlugIn.Action(async function (selection, sender) {
        const lib = PlugIn.find('com.KaitlinSalzke.followUpTask', null).library('followUpTaskLib');
        if (selection.tasks.length === 1) {
            await lib.addFollowUpTask('DROP & ADD FOLLOW-UP TASK', selection.tasks[0]);
            selection.tasks[0].drop(true);
        }
        else {
            await lib.addFollowUpTask('ADD NEW TASK', null);
        }
    });
    action.validate = function (selection, sender) {
        return selection.tasks.length === 0 || selection.tasks.length === 1;
    };
    return action;
})();
