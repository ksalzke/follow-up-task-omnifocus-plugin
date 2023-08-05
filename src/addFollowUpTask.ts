interface AddTaskForm extends Form {
  values: {
    taskName?: string
    propertiesToTransfer?: string
    move?: boolean
  }
}

interface NewTaskDetailsForm extends Form {
  values: {
    tags?: boolean
    flagged?: boolean
    deferDate?: boolean
    dueDate?: boolean
    notes?: boolean
  }
}

interface EditTaskForm extends Form {
  values: {
    move?: boolean
    tags?: Tag[]
    flagged?: boolean
    deferDate?: Date
    dueDate?: Date
    notes?: string
  }

}

interface DependencyLibrary extends PlugIn.Library {
  getDependents?: (task: Task) => Task[]
  getPrereqs?: (task: Task) => Task[]
  addDependency?: (prereq: Task, dep: Task) => Promise<void>
  removeDependency?: (prereqID: string, depID: string) => Promise<void>
}


(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const lib: FollowUpTaskLib = PlugIn.find('com.KaitlinSalzke.followUpTask', null).library('followUpTaskLib')
    lib.addFollowUpTask(selection.tasks[0])
  })

  action.validate = function (selection, sender) {
    return selection.tasks.length === 1
  }

  return action
})()
