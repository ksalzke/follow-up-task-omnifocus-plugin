(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const lib: FollowUpTaskLib = PlugIn.find('com.KaitlinSalzke.followUpTask', null).library('followUpTaskLib')
    await lib.addFollowUpTask(selection.tasks[0])
  })

  action.validate = function (selection, sender) {
    return selection.tasks.length === 1
  }

  return action
})()
