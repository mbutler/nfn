$ = window.jQuery
attach = window.zootorial.attach

attachedThing = $('#attached-thing')
bigBox = $('#big-box')

leftOf = (el) -> $(el).offset().left
rightOf = (el) -> $(el).offset().left + $(el).width()
centerOf = (el) -> (leftOf(el) + rightOf(el)) / 2

topOf = (el) -> $(el).offset().top
bottomOf = (el) -> $(el).offset().top + $(el).height()
middleOf = (el) -> (topOf(el) + bottomOf(el)) / 2

describe 'attach', ->
  beforeEach ->
    $('html, body').css margin: 0, overflow: 'hidden'

  afterEach ->
    $('html, body').css margin: '', overflow: ''

  it 'exists', ->
    expect(attach).toBeDefined()

  it 'throws with no arguments', ->
    expect(-> attach()).toThrow()

  it 'centers the element if no other arguments are given', ->
    attach attachedThing
    expect(centerOf attachedThing).toBeCloseTo window.innerWidth / 2, -2
    expect(middleOf attachedThing).toBeCloseTo window.innerHeight / 2, -2

  it 'centers a specific point of the element if coordinates are given', ->
    attach attachedThing, ['left', 'top']
    expect(leftOf attachedThing).toBeCloseTo window.innerWidth / 2, -2
    expect(topOf attachedThing).toBeCloseTo window.innerHeight / 2, -2

  it 'aligns a certain point of the element to the center of another', ->
    attach attachedThing, ['right', 'bottom'], bigBox
    expect(rightOf attachedThing).toBeCloseTo (centerOf bigBox), -2
    expect(bottomOf attachedThing).toBeCloseTo (middleOf bigBox), -2

  it 'aligns a certain point of the element to a certain point of another', ->
    attach attachedThing, ['left', 'top'], bigBox, ['right', 'bottom']
    expect(leftOf attachedThing).toBeCloseTo (rightOf bigBox), -2
    expect(topOf attachedThing).toBeCloseTo (bottomOf bigBox), -2
