const fs = require('fs')
const path = require('path')

const isBinary = require('isbinaryfile')

async function generate (dir, files, base = '', rootOptions = {}) {
  const glob = require('glob')

  glob.sync('**/*', {
    dot:true,
    cwd: dir,
    nodir: true
  }).forEach(rawPath => {
    const sourcePath = path.resolve(dir, rawPath)
    const filename = path.join(base, rawPath)

    if (isBinary.sync(sourcePath)) {
      files[filename] = fs.readFileSync(sourcePath) // return buffer
    } else {
      let content = fs.readFileSync(sourcePath, 'utf-8')
      if (path.basename(filename) === 'manifest.json') {
        content = content.replace('{{name}}', rootOptions.projectName || '')
      }
      if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
        files[`.${filename.slice(1)}`] = content
      } else if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
        files[`${filename.slice(1)}`] = content
      } else {
        files[filename] = content
      }
    }
  })
}

module.exports = (api, options, rootOptions) => {
  api.extendPackage(pkg => {
    // ------------------------- script扩展 Start -------------------------
    const scripts = pkg.scripts
    scripts.dev = "npm run dev:h5"
    scripts.commit = "git-cz"
    scripts.lint = "eslint --fix --ext .js,.vue src"
    // ------------------------- script扩展 End ---------------------------
    return {
      scripts: scripts,
      dependencies: {
        'regenerator-runtime': '^0.12.1',// 锁定版本，避免高版本在小程序中出错
        '@dcloudio/uni-helper-json': '*',
        // ------------------------- 扩展依赖 Start -------------------------
        "dayjs": "^1.9.4",
        "lodash": "^4.17.20",
        "luch-request": "^3.0.4",
        "mescroll-uni": "^1.3.3",
        // ------------------------- 扩展依赖 End ---------------------------
      },
      devDependencies: {
        'postcss-comment': '^2.0.0',
        '@dcloudio/types': '*',
        'miniprogram-api-typings': '*',
        'mini-types': '*',
        // ------------------------- 扩展Dev依赖 Start -------------------------
        "@vue/eslint-config-prettier": "^5.0.0",
        "babel-eslint": "^10.0.3",
        "commitizen": "^4.2.2",
        "commitlint": "^9.1.2",
        "eslint": "^5.16.0",
        "eslint-plugin-prettier": "^3.1.1",
        "eslint-plugin-vue": "^5.0.0",
        "git-cz": "^3.3.0",
        "husky": "~1.1.3",
        "node-sass": "^4.14.1",
        "prettier": "^1.19.1",
        "sass-loader": "^8.0.2",
        "stylelint": "^12.0.0",
        "stylelint-config-recess-order": "^2.3.0",
        "stylelint-config-standard": "^19.0.0",
        "stylelint-order": "^3.1.1",
        "stylelint-scss": "^3.12.1"
        // ------------------------- 扩展Dev依赖 End ---------------------------
      },
      // ------------------------- 扩展commit lint Start -------------------------
      husky: {
        "hooks": {
          "pre-commit": "npm run lint",
          "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
        }
      },
      config: {
        "commitizen": {
          "path": "node_modules/cz-conventional-changelog"
        }
      }
      // ------------------------- 扩展commit lint End ---------------------------
    }
  })
  if (options.template === 'default-ts') { // 启用 typescript
    api.extendPackage(pkg => {
      return {
        dependencies: {
          'vue-class-component': '^6.3.2',
          'vue-property-decorator': '^8.0.0'
        },
        devDependencies: {
          '@babel/plugin-syntax-typescript': '^7.2.0',
          '@vue/cli-plugin-typescript': '*',
          'typescript': api.hasPlugin('eslint') ? '~3.1.1' : '^3.0.0'
        }
      }
    })
  } else if (options.template === 'dcloudio/uni-template-news') {
    api.extendPackage(pkg => {
      return {
        devDependencies: {
          'node-sass': '^4.11.0',
          'sass-loader': '^7.1.0'
        }
      }
    })
  }

  api.render(async function (files) {
    Object.keys(files).forEach(name => {
      delete files[name]
    })

    const template = options.repo || options.template

    const base = 'src'
    await generate(path.resolve(__dirname, './template/common'), files)
    if (template === 'default') {
      await generate(path.resolve(__dirname, './template/default'), files, base, rootOptions)
    } else if (template === 'default-ts') {
      await generate(path.resolve(__dirname, './template/common-ts'), files)
      await generate(path.resolve(__dirname, './template/default-ts'), files, base, rootOptions)
    } else {
      const ora = require('ora')
      const home = require('user-home')
      const download = require('download-git-repo')

      const spinner = ora('模板下载中...')
      spinner.start()

      const tmp = path.join(home, '.uni-app/templates', template.replace(/[/:]/g, '-'), 'src')

      if (fs.existsSync(tmp)) {
        try {
          require('rimraf').sync(tmp)
        } catch (e) {
          console.error(e)
        }
      }

      await new Promise((resolve, reject) => {
        download(template, tmp, err => {
          spinner.stop()
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })

      await generate(tmp, files, base)
    }
  })
}
