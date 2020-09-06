const config = {
  rotation_x: {
      value: 0,
      name: 'rotation_x',
      max: 10,
      min: -10,

  },
  rotation_y: {
      value: -0.9,
      name: 'rotation_y',
      max: 10,
      min: -10,

  },
  rotation_z: {
      value: 0,
      name: 'rotation_z',
      max: 10,
      min: -10,

  },
  camera_position_x: {
        value: 5,
        name: 'camera_position_x',
        max: 10,
        min: -10,
    },
    camera_position_y: {
        value: 5,
        name: 'camera_position_y',
        max: 10,
        min: -10,

    },
    camera_position_z: {
        value: 10,
        name: 'camera_position_z',
        max: 10,
        min: -10,

    },
    camera_target_x: {
        value: 0,
        name: 'camera_target_x',
        max: 10,
        min: -10,

    },
    camera_target_y: {
        value: 1,
        name: 'camera_target_y',
        max: 10,
        min: -10,

    },
    camera_target_z: {
        value: 0,
        name: 'camera_target_z',
        max: 10,
        min: -10,

    },
    camera_up_x: {
        value: 0,
        name: 'camera_up_x',
        max: 10,
        min: -10,

    },
    camera_up_y: {
        value: 1,
        name: 'camera_up_y',
        max: 10,
        min: -10,

    },
    camera_up_z: {
        value: 0,
        name: 'camera_up_z',
        max: 10,
        min: -10,

    },

}
const initConfigInput = () => {
    let div = _e('.config')
    for (let c in config) {
        let templapte = `
        <label>
            <input type="range" class="gua-auto-slider" value="${config[c].value}" data-value="config.${c}.value" max="${config[c].max}" min="${config[c].min}" step=0.1>
            ${config[c].name}: <span class="gua-label">${config[c].value}</span>
        </label>
        <br>
        `
        appendHtml(div, templapte)
    }

    bindAll('.gua-auto-slider', 'input', function (event) {
        var target = event.target
        // log('target', target)
        var bindVar = target.dataset.value
        // console.log('bindvar', bindVar)
        var v = target.value
        // log('v', v)
        // log(`${bindVar} + '=' + ${v}`)
        eval(bindVar + '=' + v)
        var label = target.closest('label').querySelector('.gua-label')
        // console.log('v', v)
        label.innerText = v
    })

}
