
const arraysDivide=(step,array)=>{
  let result = [];
  for (let i = 0; i < array.length; i += step) {
    result.push(array.slice(i, i + step));
  }
  return result;
}



module.exports = {
  arraysDivide:arraysDivide,
}