const gulp = require('gulp')
const zip = require('gulp-zip')
const clean = require('gulp-clean')
const dayjs = require('dayjs')
const clipboardy = require('clipboardy')
const { execSync } = require('child_process')

const config = require('./preset/config')

const zipNote = process.argv.slice(4) || '' // 修改备注
if (zipNote && zipNote[0]) {
  clipboardy.writeSync(zipNote[0])
}
let zipName = '' // 生成的文件夹名称

// 清除zip文件夹
function cleanZip() {
  return gulp.src(['./zip/*.zip', './dist'], { allowEmpty: true }).pipe(clean())
}
// 生成文件夹
function createZip() {
  let userName = ''
  try {
    userName = execSync('git config user.name').toString().replace(/\n/g, '')
  } catch (error) {
    console.log('获取Git用户信息失败')
  }
  const time = dayjs().format('YYYYMMDDHHmmss')
  zipName = `${config.webSite}-${zipNote}-${userName}-${time}.zip`

  return gulp.src(['./dist/**', '!./dist/**/*js.map']).pipe(zip(zipName)).pipe(gulp.dest('./zip'))
}
gulp.task('clean', cleanZip)
gulp.task('zip', createZip)
gulp.task('default', gulp.series(['zip']))
