const e2e = require('../support/helpers/e2e')

describe('e2e headless', function () {
  e2e.setup()

  // cypress run --headless
  e2e.it('tests in headless mode pass', {
    spec: 'headless_spec.js',
    browser: ['chrome', 'electron'],
    config: {
      env: {
        'CI': process.env.CI,
        'EXPECT_HEADLESS': '1',
      },
    },
    expectedExitCode: 0,
    headed: false,
    snapshot: true,
  })

  // cypress run --headed
  // currently, Electron differs because it displays a
  // "can not record video in headed mode" error
  ;['electron', '!electron'].map((b) => {
    e2e.it(`tests in headed mode pass in ${b}`, {
      spec: 'headless_spec.js',
      config: {
        env: {
          'CI': process.env.CI,
        },
      },
      expectedExitCode: 0,
      headed: true,
      snapshot: true,
      browser: b,
    })
  })
})
