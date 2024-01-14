'use strict'

const { writeFileSync, existsSync, mkdirSync } = require('node:fs')
const { exec } = require('node:child_process')
const { remote } = require('webdriverio')
const path = require('node:path');
const os = require('node:os')
const LawsuitVoucher = require('./launcher/lawsuitVoucher.js')
const { nativate } = require('./common/utils.js')
const TEMP_DIR = path.join(os.tmpdir(), 'adv2crwling')

class InitWio {

    get firefoxCapabilities() {
        return {
            browserName: 'firefox',
            'moz:firefoxOptions': {
                prefs: {
                    'browser.download.folderList': 2,
                    //'browser.download.dir': '/caminho/para/sua/pasta/de/downloads',
                    'browser.helperApps.neverAsk.saveToDisk': 'application/pdf',
                    'pdfjs.disabled': true
                }
            }
        }
    }

    get chromeCapabilities() {
        return {
            browserName: 'chrome',
            'goog:chromeOptions': {
                prefs: {
                    //'download.default_directory': '/caminho/para/sua/pasta/de/downloads', // Defina o diretório de download
                    'download.prompt_for_download': false, // Desative a solicitação de download
                    'download.directory_upgrade': true, // Use o diretório de download definido sem solicitar confirmação
                    'plugins.always_open_pdf_externally': true, // Faça o download de PDFs automaticamente em vez de abri-los
                }
            }
        }
    }

    async initBrowser() {
        exec(`mkdir ${TEMP_DIR}`)
        global.browser = await remote({
            capabilities: this.firefoxCapabilities
        })
    }

    async closeBrowser() {
        //exec(`rm -rf ${TEMP_DIR}/*`)
        exec(`del /Q ${TEMP_DIR}\*`)
        await browser.deleteSession()
        browser = null
    }

    async start(jobData) {
        try {
            await this.initBrowser()
            await nativate(jobData.uri)

            const manager = new LawsuitVoucher()
            const result = await manager.execute(jobData)
            writeFileSync('./jobs/result.json', JSON.stringify(result, null, 2))

            await this.closeBrowser()
        } catch (error) {
            await this.closeBrowser()
            throw error
        }
    }
}
module.exports = InitWio