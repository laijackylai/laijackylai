import { drive, SWING, yaw } from '../lib/rally'

test('hairpin yaw rises monotonically to 92° and holds; drive starts during the catch', () => {
  let prev = 0
  for (let t = 0; t <= SWING + .2; t += .01) { expect(yaw(t)).toBeGreaterThanOrEqual(prev - 1e-9); prev = yaw(t) }
  expect(yaw(SWING)).toBeCloseTo(92)
  expect((yaw(.41) - yaw(.4)) / .01).toBeCloseTo(150, 0)
  expect(drive(SWING - .2)).toBe(0)
  expect(drive(SWING)).toBeGreaterThan(0)
})
