const InitWio = require('./Init.wdio')
const job = require('./jobs/data/job.json')

const initWio = new InitWio()
initWio.start(job)