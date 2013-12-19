{Dialog, Tutorial, Step} = zootorial

window.dialog = new Dialog
  content: 'This is just a dialog!'

window.tutorial = new Tutorial
  id: 'example'
  firstStep: 'welcome'

  steps:
    length: 4

    welcome: new Step
      number: 1
      header: 'Welcome to a tutorial'
      details: 'This first step blocks the interesting things from being clicked. It links directly to another step.'
      block: '.interesting'
      next: 'adventure'

    adventure: new Step
      number: 2
      attachment: 'left top .things left bottom'
      header: 'Choose your own adventure'
      details: [
        'This tutorial is attached to another element.'
        'The focus is set to an element, blocking and dimming the rest of the screen.'
        'The next step depends on which thing you click.'
        'An actionable element is defined, which should be flashing.'
        'There is a demo set, which can demonstrate what to do.'
      ].join '\n'
      instruction: 'Click the first interesting thing.'
      actionable: '.interesting.one'
      focus: '.things'
      demo: (callback) ->
        alert 'Demo the required action'
        callback()
      next:
        'click .interesting:not(".one")': 'poor'
        'click .interesting.one': 'awesome'

    poor: new Step
      header: 'You chose... poorly.'
      details: 'You should have clicked the first one. Fail to click it again to call attention to the instruction.'
      instruction: 'Click the <em>first</em> interesting thing.'
      actionable: '.interesting.one'
      next:
        'click .interesting.one': 'awesome'
        'click .interesting:not(".one")': false

    awesome: new Step
      number: 3
      header: 'Awesome!'
      details: 'You chose the first one, which is great. A function determines the next step depending on the value of the "ending" select menu above.'
      next: ->
        switch $('select[name="ending"]').val()
          when 'alternate' then 'finalAlt'
          when 'regular' then 'final'

    final: new Step
      number: 4
      title: 'Congratulations!'
      details: 'You\'ve completed the tutorial. This step has no "next" linked, so it\'s the end of the line.'
      nextButton: 'Thanks!'

    finalAlt: new Step
      number: 4
      title: 'Heck yeah dude!'
      details: 'Tutorial\'s done. Aren\'t you relieved?'
      nextButton: 'I sure am...'

window.linearTutorial = new Tutorial
  steps: [
    new Step
      details: 'This is a linear tutorial.'

    new Step
      details: 'It can still react to events.'
      instruction: 'Click the first interesting thing.'
      next:
        'click .interesting.one': true
        'click .interesting:not(".one")': false

    new Step
      header: 'Uncool'
      details: 'But it is much less cool.'
      nextButton: 'Yeah'
  ]

events = [
  'click-close-dialog', 'render-dialog', 'attach-dialog'
  'open-dialog', 'close-dialog', 'destroy-dialog'
  'start-tutorial', 'complete-tutorial', 'end-tutorial'
  'enter-tutorial-step', 'complete-tutorial-step', 'exit-tutorial-step'
]

for eventName in events then do (eventName) ->
  $(document).on eventName, (e, args...) ->
    console.log "#{eventName.toUpperCase()}:", args...

window.tutorial.start()
