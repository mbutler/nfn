$ = window.jQuery

DOCUMENT = $(document)

track = (category, action, label, value) ->
  if +location.port < 1024
    window._gaq?.push(['_trackEvent', arguments..., true]);
  else
    console.info 'Track Google Analytics event:', arguments

# DOCUMENT.on 'start-tutorial', (e, tutorial) ->
#   track 'Tutorial', 'Start', tutorial.title

# DOCUMENT.on 'complete-tutorial', (e, tutorial, {finished}) ->
#   track 'Tutorial', 'Complete', tutorial.title, finished

# DOCUMENT.on 'end-tutorial', (e, tutorial, {onStep, finished}) ->
#   track 'Tutorial', 'End', tutorial.title, onStep

# DOCUMENT.on 'enter-tutorial-step', (e, index, step, tutorial) ->
#   track 'Tutorial', 'Enter step', "#{tutorial.title} #{index}"

# DOCUMENT.on 'complete-tutorial-step', (e, index, step, tutorial, {finished}) ->
#   track 'Tutorial', 'Complete step', "#{tutorial.title} #{index}", finished
