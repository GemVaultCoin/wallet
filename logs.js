var rectype = ['t', 'd', 'e']

function _log_header(opt)
{
  console.log("---------Date: %s;--------", new Date().toISOString());
  if (opt) {
    if (opt.rt == rectype[0]) {
       console.log("Tracing ...")
    }
    if (opt.rt == rectype[1]) {
       console.log("Debugging ...")
    }
    if (opt.rt == rectype[2]) {
       console.log("Error occured ...")
    }

    if (opt.tag) {
      console.log("Tag: %s", opt.tag)
    }
  }
}

function _log_footer()
{
  console.log("---------Record end---------")
}

//opt = {rt: 'd', tag: 'getRate'}
function runtime(m, o, opt) {

  _log_header(opt)

  console.log("Message: %s", m)
  if (o)
      console.dir(o)

  _log_footer()

}

function http(mes, o, opt, res) {

}

module.exports = {runtime};
