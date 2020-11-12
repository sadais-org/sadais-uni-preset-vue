/**
 * 延迟执行，await方式调用
 * @param {Number} base 基数
 * @param {Number} radom 随机范围
 */
export function sleep(base = 20, radom = 50) {
  return new Promise(resolve => {
    const timeout = Math.random().toFixed(2) * radom + base
    setTimeout(async function() {
      resolve()
    }, timeout)
  })
}
