const fs = require('fs')
const path = require('path')
const router = require('express').Router()

const log = (...arg) => console.log(`[${new Date().toLocaleString()}]`, ...arg)
const extnameGet = filePath => fs.statSync(filePath).isDirectory() ? 'dir' : path.extname(filePath)
const cwdPath = process.cwd()

module.exports = class {
    constructor(options = {}) {
        this.controllerDir = options.controllerDir || 'controller'
        this.serviceDir = options.serviceDir || 'service'
        try {
            this.service = this.serviceBuilder(this.serviceDir.split('/'))
            this.controllerBuilder(this.controllerDir.split('/'))
        } catch (e) {
            throw new Error(e.message)
        }
        return router
    }
    controllerBuilder(controllerDir) {
        const baseDir = path.join(cwdPath, ...controllerDir)
        const files = fs.readdirSync(baseDir)
        const isFun = f => typeof f === 'function'
        files.forEach(file => {
            const filePath = path.join(baseDir, file)
            const extname = extnameGet(filePath)
            if (extname === '.js') {
                const instance = require(filePath)
                if (typeof instance !== 'object') {
                    return false
                }
                const file = filePath.substring(cwdPath.length + this.controllerDir.length + 1)
                const routerPath = file.split(path.sep).join('/').substring(0, file.length - 3)
                if (isFun(instance.get)) {
                    router.get(routerPath, instance.get.bind(this))
                }
                if (isFun(instance.post)) {
                    router.post(routerPath, instance.post.bind(this))
                }
                if (isFun(instance.put)) {
                    router.put(routerPath + '/:id', instance.put.bind(this))
                }
                if (isFun(instance.patch)) {
                    router.patch(routerPath + '/:id', instance.patch.bind(this))
                }
                if (isFun(instance.show)) {
                    router.get(routerPath + '/:id', instance.show.bind(this))
                }
                if (isFun(instance.del)) {
                    router.delete(routerPath + '/:id', instance.del.bind(this))
                }
                log('loaded controller', filePath)
            }
            if (extname === 'dir') {
                this.controllerBuilder([...controllerDir, file])
            }
        });
    }
    serviceBuilder(serviceDir, service = {}) {
        const baseDir = path.join(cwdPath, ...serviceDir)
        const files = fs.readdirSync(baseDir)
        files.forEach(file => {
            const filePath = path.join(baseDir, file)
            const extname = extnameGet(filePath)
            const key = path.basename(filePath, '.js')
            if (extname === '.js') {
                const instance = require(filePath)
                if (typeof instance !== 'object') {
                    throw new Error(file + '\'s exports is not object')
                }
                log('loaded service', filePath)
                service[key] = instance
            }
            if (extname === 'dir') {
                service[key] = this.serviceBuilder([...serviceDir, file])
            }
        });
        return service
    }
}