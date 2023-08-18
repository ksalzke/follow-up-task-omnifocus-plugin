(() => {
    const action = new PlugIn.Action(async function (selection, sender) {
        const lib = PlugIn.find('com.KaitlinSalzke.followUpTask', null).library('followUpTaskLib');
        const param = selection.tasks.length === 1 ? selection.tasks[0] : null;
        await lib.addFollowUpTask('ADD FOLLOW-UP TASK', param);
    });
    action.validate = function (selection, sender) {
        return selection.tasks.length === 1 || selection.tasks.length === 0;
    };
    return action;
})();
