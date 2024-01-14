'use sctrict'

const os = require('node:os')
const path = require('node:path');
const fs = require('node:fs')
const pdfUtil = require('pdf-to-text');
const TIME_TO_WAIT = 600000
const TIMEOUT_WIO = { timeout: TIME_TO_WAIT }
const TEMP_DIR = path.join(os.tmpdir(), 'adv2crwling')

class Utils {

    get iframeReCaptcha() { return '[title="reCAPTCHA"]' }
    get inpReCaptchaResponse() { return '[name="g-recaptcha-response"]' }

    pause(time) { return new Promise(resolve => setTimeout(resolve, time)) }

    async nativate(url) {
        await browser.url(url)
        let isIncomplete = true
        while (isIncomplete) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            const state = await browser.execute('return document.readyState')
            if (state.includes('complete')) isIncomplete = false
        }
    }

    async clickField(field) {
        const element = await browser.$(field)
        await element.isClickable()
        await element.scrollIntoView({ block: 'center' })
        await element.click()
    }

    async clickByScript(field){
        await this.checkVisibity(field)
        await browser.execute(`document.querySelector('${field}').click()`)
    }

    async setFieldValue(field, value) {
        await this.checkVisibity(field)
        await browser.$(field).setValue(value)
    }

    async setFieldValueTyping(field, value) {
        await this.clickField(field)
        await browser.keys(value)
    }

    async selectByValue(field, value) {
        await this.checkVisibity(field)
        await browser.$(field).selectByAttribute('value', value)
    }

    async selectByText(field, text) {
        await this.checkVisibity(field)
        await browser.$(field).selectByVisibleText(text)
    }

    async getAttribute(field, attribute) {
        await this.checkVisibity(field)
        return await browser.$(field).getAttribute(attribute)
    }

    async getTexts(field) {
        const arrTexts = []
        await this.checkVisibity(field)
        const arrElements = await browser.$$(field)
        for (const element of arrElements) {
            const text = await element.getText()
            text && arrTexts.push(text)
        }
        return arrTexts.filter(Boolean)
    }

    async getHTMLs(field) {
        const arrHTML = []
        await this.checkVisibity(field)
        const arrElements = await browser.$$(field)
        for (const element of arrElements) {
            const html = await element.getHTML()
            html && arrHTML.push(html)
        }
        return arrHTML.filter(Boolean)
    }

    async checkExisting(field) {
        await this.pause(1000)
        return await browser.$(field).isExisting()
    }

    async waitForExisting(field) {
        const command = async () => {
            return await browser.$(field).isExisting()
        }
        await browser.$(field).waitUntil(command, TIMEOUT_WIO)
    }

    async checkVisibity(field) {
        await this.pause(1000)
        await this.checkExisting(field)
        await browser.$(field).isDisplayed()
        await browser.$(field).scrollIntoView({ block: 'center' })
    }

    async waitForVisible(field) {
        await browser.$(field).waitForDisplayed(TIMEOUT_WIO)
        await browser.$(field).scrollIntoView({ block: 'center' })
    }

    async pageIsComplete() {
        await this.pause(1000)
        const isComplete = await browser.execute('return document.readyState')
        console.log(`page is: `, isComplete)
        if (!isComplete.includes('complete')) return await this.pageIsComplete()
    }

    async isLoagind(field) {
        const isLoading = await isVisible(field)
        console.log('Page is: ', isLoading)
        if (isLoading) return await this.isLoagind(field)
    }
    async solverReCaptcha() {
        if (!(await this.checkExisting(this.iframeReCaptcha))) return

        const scrFrame = await this.getAttribute(this.iframeReCaptcha, 'src')
        const siteUrl = await browser.getUrl()
        const siteKey = new URL(scrFrame).searchParams.get('k')

        const taskResponse = await solverCaptchaBreackers.solveRecaptcha(siteUrl, siteKey)
        await browser.execute(`document.querySelector('${this.inpReCaptchaResponse}').value = "${taskResponse}"`)
        await browser.execute(`submit()`)
    }

    async savePDF(field) {
        const filePath = path.join(TEMP_DIR, 'print.pdf')
        const pdfBuffer = await browser.savePDF(filePath)
        const storageID = null // PostDocument.post('print.pdf', pdfBuffer)
        return {
            pdfpath: filePath,
            storageid: storageID
        }
    }

    waitDownloadDocument() {
        return new Promise((resolve, reject) => {
            const timeoutID = setTimeout(() => reject('TIMEOUT EXEED'), 60000 * 5)
            try {
                let resolved = false
                const downloadPath = path.join(os.homedir(), 'Downloads')
                const watcher = fs.watch(downloadPath, (event, filename) => {
                    if (resolved) return

                    if (event == 'change' && !filename.includes('.part')) {
                        resolved = true
                        clearTimeout(timeoutID)
                        /* const pdfBuffer = fs.readFileSync(path.join(downloadPath, filename))
                         PostDocument.post(filename, pdfBuffer).then(storageID =>{
                            watcher.close()
                            resolve({
                                pdfpath: path.join(downloadPath, filename),
                                storageid: storageID
                            })    
                        }) */

                        watcher.close()
                        resolve({
                            pdfpath: path.join(downloadPath, filename),
                            storageid: ''
                        })
                    }
                })

            } catch (error) {
                clearTimeout(timeoutID)
                reject(error)
            }

        })
    }

    async pdfToText(filePath) {
        console.log(filePath)
        return new Promise((resolve, reject) => {
            try {
                pdfUtil.pdfToText(filePath, function (err, data) {
                    if (err) reject(err);
                    const pdfText = data.replace(/\s+/g, ' ').trim()
                    return resolve(pdfText)
                });
            } catch (error) {
                reject(error)
            }
        })
    }

    addDaysToDate(date, daysToAdd) {
        const millisecondsPerDay = 24 * 60 * 60 * 1000
        const timestamp = new Date(date).getTime()
        const newTimestamp = timestamp + (Number(daysToAdd) * millisecondsPerDay)
        return new Date(newTimestamp)
    }

}
module.exports = new Utils()