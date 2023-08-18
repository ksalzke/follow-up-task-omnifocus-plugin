(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const lib: FollowUpTaskLib = PlugIn.find('com.KaitlinSalzke.followUpTask', null).library('followUpTaskLib')

    if (selection.tasks.length === 1) {
      await lib.addFollowUpTask('COMPLETE & ADD FOLLOW-UP TASK', selection.tasks[0])
      selection.tasks[0].markComplete()
    } else {
      await lib.addFollowUpTask('ADD NEW TASK', null)
    }

  })

  action.validate = function (selection, sender) {
    return selection.tasks.length === 0 || selection.tasks.length === 1
  }

  return action
})()
