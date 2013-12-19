$ = window.jQuery

$document = $(document)

wait = (time, fn) ->
  [time, fn] = [0, time] if typeof time is 'function'
  setTimeout fn, time
