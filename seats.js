/*!
 * Copyright 2022-2023 Sichuan Chuzhixi Technology Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;(function(window) {
    'use strict';

    function extend(a, b) {
        for(let key in b) {
            if(b.hasOwnProperty(key)) {
                a[key] = b[key]
            }
        }
        return a
    }

    function Error(name, message) {
        this.method = name
        this.message = message
    }

    /**
     * @param arr
     * @param key
     * @param flag
     * @returns {*}
     * @constructor
     */
    function ArrayMultiSort(arr, key, flag = 'desc') {
        for (let i = 0; i < arr.length; i++) {
            for(let k = 0; k < arr.length - 1 - i; k++) {
                if (arr[k][key] > arr[k + 1][key] && flag === 'asc') {
                    let temp = arr[k]
                    arr[k] = arr[k + 1]
                    arr[k + 1] = temp
                }
                if (arr[k][key] < arr[k + 1][key] && flag === 'desc') {
                    let temp = arr[k + 1]
                    arr[k + 1] = arr[k]
                    arr[k] = temp
                }
            }
        }
        return arr
    }

    /**
     * @param el
     * @param options
     * @constructor
     */
    function Seats(el, options) {
        this.canvasEl = el
        this.hammer = null
        this.options = extend({}, this.options)
        extend(this.options, options)
        this._init()
    }

    /**
     * @type {{seatsData: null, diff_x: number, diff_y: number, best_range: {yMin: number, yMax: number, xMax: number, xMin: number}, _maxMap: {seatCenter: {x: number, y: number}, _zoom: {_current: number, _max: number, _min: number}, seatOptions: {maxW: number, minSeatSingleW: number, yMin: number, minSeatSingleH: number, yMax: number, seatOverAllW: number, seatSingleW: number, seatSingleH: number, seatOverAllH: number, seatBestPoi: null, xMax: number, xMin: number}, _offset: {_mid: number, _bottom: number, x: number, y: number, first_x: number}, background: {love: null, sold: null, set: null, un_love: null, best: null, best_line: null, un_set: null, sold_love: null}, center: {x: number, y: number}, screenW: number, soldSeatsIcon: {}, isDrag: boolean}, max_num: number}}
     * @private
     */
    Seats.prototype._options = {
        max_num: 4,
        _maxMap: {
            footerLogo: null,
            _zoom: {
                _current: 1,
                _max: 1,
                _min: 0
            },
            center: {
                x: 0,
                y: 0
            },
            seatCenter: {
                x: 0,
                y: 0
            },
            seatOptions: {
                xMax: 0,
                yMax: 0,
                xMin: Infinity,
                yMin: Infinity,
                seatOverAllW: 0,
                seatOverAllH: 0,
                seatSingleW: 0,
                seatSingleH: 0,
                maxW: 35,
                minSeatSingleW: 0,
                minSeatSingleH: 0,
                seatBestPoi: null
            },
            _offset: {
                x: 0,
                y: 0,
                _bottom: 0,
                _mid: 8,
                first_x: 0
            },
            screenW: window.innerWidth || window.screen.width,
            isDrag: false,
            background: {
                un_set: null,
                set: null,
                love: null,
                un_love: null,
                sold: null,
                sold_love: null,
                best: null,
                best_line: null,
                love_mend: null,
                mend: null
            },
            soldSeatsIcon: {}
        },
        seatsData: null,
        best_range: {
            xMin: Infinity,
            yMin: Infinity,
            xMax: 0,
            yMax: 0
        },
        diff_x: 0,
        diff_y: 0
    }

    /**
     * @type {{maxMap: {sequence: null, image_option: {love: {w: number, h: number}, normal: {w: number, h: number}}, blank: {top: number, left: number, right: number}, maxSelectNum: number, ctx: null, line: {best_color: string, center_color: string}, selectSeatCall: (function(*): boolean)}, alert_option: {bg_color: string, alert_text: string, fontSize: string, text_color: string, els: {div: null, img: null, span: null}, is_show_alert: boolean, img_src: string}}}
     */
    Seats.prototype.options = {
        alert_option: {
            alert_text: '非常棒最佳观影区位置~',
            img_src: '',
            bg_color: '#ff9800',
            text_color: '#fff',
            fontSize: '12px',
            els: {
                div: null,
                span: null,
                img: null
            },
            is_show_alert: false
        },
        maxMap: {
            image_option: {
                love: {
                    w: 152,
                    h: 64
                },
                normal: {
                    w: 68,
                    h: 64
                }
            },
            ctx: null,
            sequence: null,
            line: {
                best_color: '#F00',
                center_color: '#c8c8c8'
            },
            blank: {
                left: 0,
                right: 0,
                top: 0
            },
            _copy_blank: {
                left: 0,
                right: 0,
                top: 0
            },
            maxSelectNum: 4,
            selectSeatCall: function (data) {return false}
        }
    }

    /**
     * Draw a big seat map
     */
    Seats.prototype.drawLargeMap = function () {
        let ctx = this.options.maxMap.ctx
        ctx.save()
        this._clearMaxMap()
        ctx.restore()
        this._drawLargeMapCenterLine()
        this._drawFooterLogo()
        ctx.setTransform(
            this._options._maxMap._zoom._current, 0, 0,
            this._options._maxMap._zoom._current,
            this._options._maxMap._offset.x,
            this._options._maxMap._offset.y
        )
        this._drawLargeMapSeat()
        this._seat_options.prev_key = ''
        this._drawBestLine()
        ctx.save()
    }

    /**
     * @private
     */
    Seats.prototype._drawFooterLogo = function () {
        if(!this._options._maxMap.footerLogo) {
            return
        }
        let center = this.GetMapCenter()
        let ctx = this.options.maxMap.ctx,
            all_h = this._options._maxMap.seatOptions.seatOverAllH,
            yMax = this._options._maxMap.seatOptions.yMax,
            _diff_y = this._options.diff_y,
            offset_y = this._options._maxMap._offset.y,
            zoom = this._options._maxMap._zoom._current
        ctx.drawImage(
            this._options._maxMap.footerLogo,
            0,
            0,
            96,
            40,
            center.x - 25,
            all_h * zoom + ((yMax - _diff_y) * 4) + offset_y + 50 * zoom,
            48,
            20
        )
    }

    Seats.prototype._default_option = function () {
        this._options._maxMap._zoom._current = 1
        this._options._maxMap._zoom._min = 1
        this._options._maxMap.seatOptions.yMax = 0
        this._options._maxMap.seatOptions.xMax = 0
        this._options._maxMap.seatOptions.xMin = Infinity
        this._options._maxMap.seatOptions.yMin = Infinity
        this._options._maxMap.center.x = this._options._maxMap.screenW / 2
        this.options.maxMap.screen.el.style.transform = 'none'
        this._options._maxMap._offset = {
            x: 0,
            y: this.options.maxMap._copy_blank.top,
            _bottom: 0,
            _mid: 8,
            first_x: 0
        }
    }

    /**
     * @private
     */
    Seats.prototype._calcSeat = function () {
        this._default_option()
        let best_range = {
            xMax: 0,
            yMax: 0,
            xMin: Infinity,
            yMin: Infinity
        }
        this._options.seatsData.forEach(item => {
            this._options._maxMap.seatOptions.yMax < item.y && (this._options._maxMap.seatOptions.yMax = item.y)
            this._options._maxMap.seatOptions.yMin > item.y && (this._options._maxMap.seatOptions.yMin = item.y)
            this._options._maxMap.seatOptions.xMax < item.x && (this._options._maxMap.seatOptions.xMax = item.x)
            this._options._maxMap.seatOptions.xMin > item.x && (this._options._maxMap.seatOptions.xMin = item.x)
            if(item.is_best) {
                item.x > best_range.xMax && (best_range.xMax = item.x)
                item.y > best_range.yMax && (best_range.yMax = item.y)
                item.x < best_range.xMin && (best_range.xMin = item.x)
                item.y < best_range.yMin && (best_range.yMin = item.y)
            }
        })
        this._options._maxMap.seatOptions.xMin > 1 && (this._options.diff_x = this._options._maxMap.seatOptions.xMin - 1)
        this._options._maxMap.seatOptions.yMin > 1 && (this._options.diff_y = this._options._maxMap.seatOptions.yMin - 1)
        this._options.best_range = best_range
        let left = this.options.maxMap.blank.left,
            right = this.options.maxMap.blank.right,
            mid = this._options._maxMap._offset._mid,
            x_max = this._options._maxMap.seatOptions.xMax - this._options.diff_x,
            other_w = left + right + x_max * (mid + 1)
        this._options._maxMap.seatOptions.seatSingleW = this._options._maxMap.seatOptions.maxW
        let map_w = x_max * this._options._maxMap.seatOptions.seatSingleW + other_w
        if(map_w !== this._options._maxMap.screenW) {
            let zoom = this._options._maxMap.screenW / map_w
            this._options._maxMap._zoom._current = Math.floor(zoom * 100) / 100
            this._options._maxMap._zoom._min = Math.floor(zoom * 100) / 100
        }
        if(this._options._maxMap._zoom._current > 1) {
            this._options._maxMap._zoom._current = 1
            this._options._maxMap._zoom._min = 1
        }
        this._options._maxMap.seatOptions.seatSingleH = this._options._maxMap.seatOptions.seatSingleW
        this._options._maxMap.seatOptions.seatOverAllW = (this._options._maxMap.seatOptions.xMax - this._options.diff_x) * this._options._maxMap.seatOptions.seatSingleW
        this._options._maxMap.seatOptions.seatOverAllH = (this._options._maxMap.seatOptions.yMax - this._options.diff_y) * this._options._maxMap.seatOptions.seatSingleH
        this._calcSeatStartCenter()
    }

    /**
     * @private
     */
    Seats.prototype._calcSeatStartCenter = function () {
        let xMax = this._options._maxMap.seatOptions.xMax - this._options.diff_x,
            mid = this._options._maxMap._offset._mid,
            left = this.options.maxMap.blank.left,
            zoom = this._options._maxMap._zoom._current

        // 计算中心偏移距离
        let seatMidAllW = xMax * mid * zoom

        // 座位map宽度
        let seatTR = this._options._maxMap.seatOptions.seatOverAllW * zoom + seatMidAllW + left

        // 座位map中心点
        this._options._maxMap.seatCenter.x = seatTR / 2
        if(this._options._maxMap.center.x !== this._options._maxMap.seatCenter.x) {
            let num = seatTR - this._options._maxMap.center.x
            if(num > 0) {
                this._options._maxMap._offset.x = (this._options._maxMap.center.x - num + left + mid * zoom / 2) / 2
                this._options._maxMap._offset.x += -mid * zoom
            } else {
                this._options._maxMap._offset.x = (this._options._maxMap.center.x + Math.abs(num) + left) / 2
                if(this._options._maxMap._zoom._current === this._options._maxMap._zoom._max && this._options._maxMap._zoom._max === 1) {
                    this._options._maxMap._offset.x += -mid + mid / 4
                } else {
                    this._options._maxMap._offset.x += -mid * zoom / 2
                }
            }
        }
        this._options._maxMap._offset.first_x = this._options._maxMap._offset.x
    }

    /**
     * @private
     */
    Seats.prototype._drawLeftSequence = function () {
        let container = this.options.maxMap.sequence
        if(!container || !container.el) {return}
        container.el.innerHTML = ''
        let ul = document.createElement('ul')
        if(this.options.maxMap.sequence.style) {
            for (const key in this.options.maxMap.sequence.style) {
                container.el.style[key] = this.options.maxMap.sequence.style[key]
            }
        }
        container.el.style.top = this.options.maxMap.blank.top + 'px'
        let num = this._options._maxMap.seatOptions.yMax - this._options.diff_y
        let yMax = num,
            h = this._options._maxMap.seatOptions.seatSingleH * this._options._maxMap._zoom._current,
            mid = this._options._maxMap._offset._mid * this._options._maxMap._zoom._current
        while (num--) {
            let li = document.createElement('li')
            li.style.height = h + 'px'
            if(yMax - num > 1) {
                li.style.paddingTop = mid + 'px'
            }
            li.style.lineHeight = h + 'px'
            li.style.textAlign = 'center'
            li.style.fontSize = '12px'
            li.innerHTML = yMax - num
            ul.appendChild(li)
        }
        container.el.appendChild(ul)
    }

    /**
     * @private
     */
    Seats.prototype._drawLargeMapCenterLine = function () {
        let yMax = this._options._maxMap.seatOptions.yMax,
            _diff_y = this._options.diff_y,
            zoom = this._options._maxMap._zoom._current,
            max_zoom = this._options._maxMap._zoom._max,
            offset_y = this._options._maxMap._offset.y,
            all_h = this._options._maxMap.seatOptions.seatOverAllH
        this.options.maxMap.ctx.translate(1, 1)
        this.options.maxMap.ctx.lineWidth = 1
        this.options.maxMap.ctx.setLineDash([6, 3])
        this.options.maxMap.ctx.strokeStyle = this.options.maxMap.line.center_color
        let center = this.GetMapCenter()
        this.options.maxMap.ctx.beginPath()
        let x_offset = 0
        if(this._options._maxMap.isDrag && zoom === max_zoom) {
            x_offset = -2
        }
        if(this._options._maxMap.isDrag && zoom !== max_zoom) {
            x_offset = -2
        }
        let x = (3 + x_offset) * zoom
        this.options.maxMap.ctx.moveTo(
            center.x - x,
            offset_y - 10
        )
        this.options.maxMap.ctx.lineTo(
            center.x - x,
            all_h * zoom + ((yMax - _diff_y) * 4) + offset_y + 40 * zoom
        )
        this.options.maxMap.ctx.stroke()
        this.options.maxMap.ctx.closePath()
    }

    /**
     * @param data
     * @returns {Seats}
     * @constructor
     */
    Seats.prototype.setFooterLogo = function (data) {
        if(!data) {
            throw new Error('setFooterLogo','Seat background image data parameter is empty.')
        }
        this._options._maxMap.footerLogo = this._createImageEl(data)
        return this
    }

    /**
     * @param data
     * @returns {Seats}
     * @constructor
     */
    Seats.prototype.setBackground = function (data) {
        if(!data) {
            throw new Error('setBackground','Seat background image data parameter is empty.')
        }
        let options = {}
        for (const dataKey in data) {
            options[dataKey] = this._createImageEl(data[dataKey])
        }
        this._options._maxMap.background = options
        return this
    }

    /**
     * @param url
     * @returns {HTMLImageElement|*[]}
     * @private
     */
    Seats.prototype._createImageEl = function (url) {
        let otherEl = document.querySelector('.other-div-images'), isExist = true
        if(!otherEl) {
            otherEl = document.createElement('div')
            otherEl.style.width = '0px'
            otherEl.style.height = '0px'
            otherEl.setAttribute('class', 'other-div-images')
            isExist = false
        }
        let images = null
        let createImg = (urlStr) => {
            let img = document.createElement('img')
            img.style.width = '0px'
            img.style.height = '0px'
            img.setAttribute('src', urlStr)
            otherEl.appendChild(img)
            return img
        }
        if(url instanceof Array) {
            images = []
            url.forEach(item => {
                images.push(createImg(item))
            })
        } else {
            images = createImg(url)
        }
        !isExist && document.body.appendChild(otherEl)
        return images
    }

    /**
     * @private
     */
    Seats.prototype._drawBestLine = function () {
        let ctx = this.options.maxMap.ctx,
            range = this._options.best_range,
            _diff_x = this._options.diff_x,
            _diff_y = this._options.diff_y,
            zoom = this._options._maxMap._zoom._current,
            mid = this._options._maxMap._offset._mid,
            w = this._options._maxMap.seatOptions.seatSingleW,
            h = this._options._maxMap.seatOptions.seatSingleH,
            left = this._options._maxMap._offset.x,
            top = this._options._maxMap._offset.y,
            x_all_w = (range.xMin - _diff_x - 1 > 0 ? range.xMin - _diff_x - 1 : 0) * w * zoom,
            x_mid_w = (range.xMin - _diff_x - 1 > 0 ? range.xMin - _diff_x - 1 : 0) * mid * zoom,
            y_all_h = (range.yMin - _diff_y - 1 > 0 ? range.yMin - _diff_y - 1 : 0) * h * zoom,
            y_mid_h = (range.yMin - _diff_y - 1 > 0 ? range.yMin - _diff_y - 1 : 0) * mid * zoom
        let x_min = x_all_w + left + x_mid_w,
            x_max = x_min + (w + mid) * (range.xMax - range.xMin + 1),
            diff_x = x_max - x_min ,
            y_min = y_all_h + top + y_mid_h,
            y_max = y_min + (h + mid) * (range.yMax - range.yMin + 1),
            diff_y = y_max - y_min
        ctx.translate(1, 1)
        ctx.lineWidth = 1
        ctx.strokeStyle = this.options.maxMap.line.best_color
        ctx.roundRect(
            (range.xMin - _diff_x - 1) * (w + mid) + mid / 2 - 1,
            (range.yMin - _diff_y - 1) * (h + mid) - mid / 2 - 1,
            diff_x,
            diff_y,
            5
        ).stroke()
    }

    /**
     * Draw a map of each seat
     * @private
     */
    Seats.prototype._drawLargeMapSeat = function () {
        let ctx = this.options.maxMap.ctx
        this._options.seatsData.forEach(item => {
            ctx.fillStyle = 'transparent'
            if(item.type === 0) {
                this._drawLargeMapLoveSeat(ctx, item)
            } else {
                this._drawLargeMapRoutineSeat(ctx, item)
            }
        })
    }

    /**
     * @returns {*}
     * @private
     */
    Seats.prototype._randomGetSold = function () {
        let sold = this._options._maxMap.background.sold
        if(!sold) {
            throw new Error('drawLargeMap','Seat map setting error, sold icon is empty.')
        }
        if(!sold instanceof Array) {
            throw new Error('drawLargeMap','The sold icon must be an array.')
        }
        return sold[Math.floor((Math.random() * sold.length))]
    }

    /**
     * @param ctx
     * @param data
     * @private
     */
    Seats.prototype._drawLargeMapRoutineSeat = function (ctx, data) {
        let mid = this._options._maxMap._offset._mid,
            diff_x = this._options.diff_x,
            diff_y = this._options.diff_y
        let theme = (data) => {
            switch (data.status) {
                case 0:
                    return this._options._maxMap.background.un_set
                case 1:
                    return this._options._maxMap.background.set
                case 2:
                    if(this._options._maxMap.soldSeatsIcon[data.x + '@' + data.y]) {
                        return this._options._maxMap.soldSeatsIcon[data.x + '@' + data.y]
                    }
                    let icon = this._randomGetSold()
                    this._options._maxMap.soldSeatsIcon[data.x + '@' + data.y] = icon
                    return icon
                default:
                    return this._options._maxMap.background.mend
            }
        }
        ctx.fillRect(
            (data.x - diff_x - 1) * this._options._maxMap.seatOptions.seatSingleW + (data.x - diff_x) * mid,
            (data.y - diff_y - 1) * (this._options._maxMap.seatOptions.seatSingleH + mid),
            this._options._maxMap.seatOptions.seatSingleW - 1,
            this._options._maxMap.seatOptions.seatSingleH
        )
        ctx.drawImage(
            theme(data),
            0,
            0,
            this.options.maxMap.image_option.normal.w,
            this.options.maxMap.image_option.normal.h,
            (data.x - diff_x - 1) * this._options._maxMap.seatOptions.seatSingleW + (data.x - diff_x) * mid,
            (data.y - diff_y - 1) * (this._options._maxMap.seatOptions.seatSingleH + mid),
            this._options._maxMap.seatOptions.seatSingleW,
            this._options._maxMap.seatOptions.seatSingleH
        )
    }

    /**
     * @type {{prev_x: number, prev_y: number}}
     * @private
     */
    Seats.prototype._seat_options = {
        prev_x: -1,
        prev_y: -1,
        prev_key: '',
        min_prev_key: ''
    }

    /**
     * @param ctx
     * @param data
     * @private
     */
    Seats.prototype._drawLargeMapLoveSeat = function (ctx, data) {
        let mid = this._options._maxMap._offset._mid,
            diff_x = this._options.diff_x,
            diff_y = this._options.diff_y
        let theme = (data) => {
            switch (parseInt(data.status)) {
                case 0:
                    return this._options._maxMap.background.un_love
                case 1:
                    return this._options._maxMap.background.love
                case 2:
                    if(this._options._maxMap.soldSeatsIcon[data.x + '@' + data.y]) {
                        return this._options._maxMap.soldSeatsIcon[data.x + '@' + data.y]
                    }
                    let icon = this._options._maxMap.background.sold_love
                    this._options._maxMap.soldSeatsIcon[data.x + '@' + data.y] = icon
                    return icon
                default:
                    return this._options._maxMap.background.love_mend
            }
        }
        if(data.key !== this._seat_options.prev_key) {
            ctx.fillRect(
                (data.x - diff_x - 1) * this._options._maxMap.seatOptions.seatSingleW + (data.x - diff_x) * mid,
                (data.y - diff_y - 1) * (this._options._maxMap.seatOptions.seatSingleH + mid),
                this._options._maxMap.seatOptions.seatSingleW * 2 + mid,
                this._options._maxMap.seatOptions.seatSingleH
            )
            ctx.drawImage(
                theme(data),
                0,
                0,
                this.options.maxMap.image_option.love.w,
                this.options.maxMap.image_option.love.h,
                (data.x - diff_x - 1) * this._options._maxMap.seatOptions.seatSingleW + (data.x - diff_x) * mid,
                (data.y - diff_y - 1) * (this._options._maxMap.seatOptions.seatSingleH + mid),
                this._options._maxMap.seatOptions.seatSingleW * 2 + mid,
                this._options._maxMap.seatOptions.seatSingleH
            )
            this._seat_options = {
                prev_x: data.x,
                prev_y: data.y,
                prev_key: data.key
            }
        }
    }

    /**
     * @private
     */
    Seats.prototype._roundStrokeRect = function () {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (w < 2 * r) {r = w / 2}
            if (h < 2 * r){ r = h / 2}
            this.beginPath()
            this.moveTo(x + r, y)
            this.arcTo(x + w, y, x + w, y + h, r)
            this.arcTo(x + w, y + h, x, y + h, r)
            this.arcTo(x, y + h, x, y, r)
            this.arcTo(x, y, x + w, y, r)
            this.closePath()
            return this
        }
    }

    /**
     * Clear map
     */
    Seats.prototype._clearMaxMap = function () {
        this.options.maxMap.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height)
        this.canvasEl.width = this.canvasEl.width
    }

    /**
     * @private
     */
    Seats.prototype._init = function () {
        this.options.maxMap.ctx = this.canvasEl.getContext('2d')
        if(this.options.minMap && this.options.minMap.el && !this.options.minMap.ctx) {
            this.options.minMap.ctx = this.options.minMap.el.getContext('2d')
        }
        this.options.maxMap._copy_blank = this.options.maxMap.blank
        this._options.max_num = this.options.maxMap.maxSelectNum
        this._options._maxMap._offset.x = this.options.maxMap.blank.left
        this._options._maxMap._offset.y = this.options.maxMap.blank.top
        this._options._maxMap.center.x = this._options._maxMap.screenW / 2
        this._createdAlertNode()
        this._roundStrokeRect()
        this._initEvents()
        this.options.maxMap._copy_blank = this.options.maxMap.blank
    }

    /**
     * @private
     */
    Seats.prototype._initEvents = function () {
        this.hammer = new Hammer.Manager(this.canvasEl)
        this.hammer.add(new Hammer.Pan)
        this.hammer.add(new Hammer.Tap)
        this.hammer.add(new Hammer.Pinch)
        this.hammer.on('tap', this._largeTap.bind(this))
        // this.canvasEl.addEventListener('click', this._canvasClick.bind(this))
        this.hammer.on('panstart', this._largePanStart.bind(this))
        this.hammer.on('panmove', this._largePanMove.bind(this))
        this.hammer.on('panend', this._largePanEnd.bind(this))
        this.hammer.on('pinchstart', this._largePinchStart.bind(this))
        this.hammer.on('pinchmove', this._largePinchMove.bind(this))
        this.hammer.on('pinchend', this._largePinchEnd.bind(this))
    }

    /**
     * @param data
     * @param scale
     * @private
     */
    Seats.prototype._updateUI = function (data, scale) {
        let n_x = data.center.x - this.options.maxMap.blank.left,
            n_y = data.center.y - this.options.maxMap.blank.top,
            _zoom = this._options._maxMap._zoom._current,
            canvas_el_top = this.canvasEl.offsetTop
        let r_x = parseInt(n_x / _zoom, 10),
            r_y = parseInt(n_y / _zoom, 10),
            scale_x = parseInt(n_x / scale, 10),
            scale_y = parseInt(n_y / scale, 10)
        this._options._maxMap._zoom._current = 1
        let x = this._options._maxMap._offset.x - (r_x - scale_x),
            y = this._options._maxMap._offset.y - (r_y - scale_y) + canvas_el_top
        this._setMapX(x)
        this._setMapY(y)
        this._boundary()
        this._setMapCenter()
        this._drawLeftSequence()
        this._leftSequenceMove(this._options._maxMap._offset.y)
        this.drawLargeMap()
        this._updateScreen()
    }

    /**
     * @param data
     * @private
     */
    Seats.prototype._largeTap = function (data) {
        this._canvasClick(data.srcEvent)
        if(this._options._maxMap._zoom._current === 1) {
            return
        }
        this._updateUI(data, this._options._maxMap._zoom._max)
    }

    /**
     * @param data
     * @private
     */
    Seats.prototype._canvasClick = function (data) {
        let page_x = data.pageX, page_y = data.pageY, zoom = this._options._maxMap._zoom._current,
            mid = this._options._maxMap._offset._mid, w = this._options._maxMap.seatOptions.seatSingleW,
            h = this._options._maxMap.seatOptions.seatSingleH, left = this._options._maxMap._offset.x,
            top = this._options._maxMap._offset.y, _diff_x = this._options.diff_x, _diff_y = this._options.diff_y
        page_x || (page_x = data.clientX + (window.document.body.scrollLeft || window.document.documentElement.scrollLeft))
        page_y || (page_y = data.clientY + (window.document.body.scrollTop || window.document.documentElement.scrollTop))
        let n_x = page_x - this.canvasEl.offsetLeft,
            n_y = page_y - this.canvasEl.offsetTop,
            r_x = n_x,
            r_y = n_y
        let seats = this._options.seatsData.filter(item => {
            let x = (item.x - _diff_x - 1 > 0 ? item.x - _diff_x - 1 : 0) * w * zoom + left + mid * zoom * (item.x - _diff_x),
                y = (item.y - _diff_y - 1 > 0 ? item.y - _diff_y - 1 : 0) * h * zoom + top + (item.y - _diff_y - 1 > 0 ? mid * zoom * (item.y  - _diff_y - 1) : 0)
            let _x = x + w * zoom,
                _y = y + h * zoom
            return x <= r_x && r_x <= _x && y <= r_y && r_y <= _y
        })
        this._selectSeat(seats)
    }

    /**
     * @param rowNum
     * @param startPos
     * @param endPos
     * @returns {boolean}
     */
    Seats.prototype.checkRowSeatContinusAndEmpty = function (rowNum, startPos, endPos) {
        let isValid = true,
            data = this._options.seatsData
        for(let i = startPos; i <= endPos; i++) {
            for (let j = 0; j < data.length; j++) {
                if(data[j].x - this._options.diff_x === i && data[j].y - this._options.diff_y === rowNum && data[j].status !== 0) {
                    return false
                }
            }
        }
        return isValid
    }

    /**
     * @param row
     * @param startPos
     * @param endPos
     * @returns {*[]}
     */
    Seats.prototype.generateRowResult = function (row, startPos, endPos) {
        let result = []
        for(let i = startPos; i <= endPos; i++) {
            result.push([row, i])
        }
        return result
    }

    /**
     * @param result
     */
    Seats.prototype.chooseSeat = function (result) {
        let data = [], is_best = false
        this._options.seatsData.filter(item => {
            for(let i = 0; i < result.length; i++) {
                if(item.x - this._options.diff_x === result[i][1] && item.y - this._options.diff_y === result[i][0]) {
                    item.status = 1
                    data.push(item)
                    item.is_best && (is_best = true)
                }
            }
            return item
        })
        if(is_best) {
            this.showAlert()
        }
        this.options.maxMap.selectSeatCall(data)
    }

    /**
     * @param row
     * @param startPos
     * @param endPos
     * @param num
     * @returns {*}
     * @private
     */
    Seats.prototype._distance = function (row, startPos, endPos, num) {
        let best_data = this._options.best_range
        for(let i = startPos; i <= endPos; i++) {
            if(i >= best_data.xMin - this._options.diff_x && i <= best_data.xMax - this._options.diff_x) {
                num--
            }
        }
        return num
    }

    /**
     * @param fromRow
     * @param toRow
     * @param num
     * @returns {*[]}
     */
    Seats.prototype.searchSeatByDirection = function (fromRow, toRow, num) {
        let currentDirectionSearchResult = []
        let largeRow = fromRow > toRow ? fromRow : toRow,
            smallRow = fromRow > toRow ? toRow : fromRow,
            x_max = this._options._maxMap.seatOptions.xMax - this._options.diff_x
        // 逐行搜索
        for(let i = smallRow; i <= largeRow; i++) {
            // 每一排的搜索,找出该排里中轴线最近的一组座位
            let tempRowResult = [],
                minDistanceToMidLine = Infinity
            for(let j = 1; j <= x_max - num + 1; j++) {
                // 如果有合法位置
                if(this.checkRowSeatContinusAndEmpty(i, j, j + num - 1)) {
                    // 计算该组位置距离中轴线的距离:该组位置的中间位置到中轴线的距离
                    let distance = this._distance(i, j, j + num - 1, num);
                    // 如果距离较短则更新
                    if(distance < minDistanceToMidLine) {
                        minDistanceToMidLine = distance;
                        tempRowResult = this.generateRowResult(i, j, j + num - 1)
                    }
                }
            }
            //保存该行的最终结果
            currentDirectionSearchResult.push({
                result: tempRowResult,
                offset: minDistanceToMidLine
            })
        }

        //处理后排的搜索结果:找到距离中轴线最短的一个
        //注意这里的逻辑需要区分前后排，对于后排是从前往后，前排则是从后往前找
        let isBackDir = fromRow < toRow
        let finalReuslt = [], minDistanceToMid = Infinity
        if(isBackDir) {
            currentDirectionSearchResult.forEach(item => {
                if(item.offset < minDistanceToMid){
                    finalReuslt = item.result
                    minDistanceToMid = item.offset
                }
            })
        } else {
            let data = currentDirectionSearchResult.reverse()
            data.forEach(item => {
                if(item.offset < minDistanceToMid && item.result.length && item.result[0][0] > 0) {
                    finalReuslt = item.result;
                    minDistanceToMid = item.offset;
                }
            })
        }
        return finalReuslt
    }

    /**
     * @param data
     */
    Seats.prototype.closeSeatHandler = function (data) {
        if(!data) {
            throw new Error('closeSeatHandler','Seat data cannot be empty.')
        }
        this._options.seatsData.filter(item => {
            if(data.x === item.x && data.y === item.y && item.status === 1) {
                item.status = 0
                this.options.maxMap.maxSelectNum++
            }
        })
        this.drawLargeMap()
    }

    /**
     * @param num
     */
    Seats.prototype.recSeatHandler = function (num) {
        let y_max = this._options._maxMap.seatOptions.yMax - this._options.diff_y,
            max_num = this.options.maxMap.maxSelectNum
        let rowStart = this._options.best_range.yMin - this._options.diff_y
        let backResult = this.searchSeatByDirection(rowStart, y_max - 1, num)
        if(backResult.length > 0) {
            if(backResult.length > max_num) {
                this.setAlertText('最多可选' + max_num + '个座位').showAlert()
                return
            }
            max_num -= backResult.length
            this.options.maxMap.maxSelectNum = max_num
            this.chooseSeat(backResult)
        } else {
            let forwardResult = this.searchSeatByDirection(rowStart, 0, num);
            if(forwardResult.length > 0) {
                if(forwardResult.length > max_num) {
                    this.setAlertText('最多可选' + max_num + '个座位').showAlert()
                    return
                }
                max_num -= forwardResult.length
                this.options.maxMap.maxSelectNum = max_num
                this.chooseSeat(forwardResult)
            }
        }
        this.drawLargeMap()
    }

    /**
     * @param seats
     * @private
     */
    Seats.prototype._selectSeat = function (seats) {
        let isLoveSeat = (data) => {
            let next_seat = null
            if(data.type === 0) {
                this._options.seatsData.filter(item => {
                    if(data.key === item.key && data.y === item.y && data.x !== item.x) {
                        next_seat = item
                    }
                })
                return next_seat
            }
            return null
        }
        let loves = null
        if(seats && seats.length) {
            seats = seats[0]
            this._options.seatsData.filter(item => {
                if(item.x === seats.x && item.y === seats.y && item.type === 0 && item.status !== 2) {
                    loves = [item, isLoveSeat(item)]
                }
                if(item.x === seats.x && item.y === seats.y && item.type === 1 && item.status !== 2) {
                    this._singleSelectCall(item)
                }
                return item
            })
            if(loves) {
                this._loveSelectCall(loves)
                this._selectLoveSeat(loves[0], loves[1])
            }
            this.drawLargeMap()
        }
    }

    /**
     * @param loves
     * @private
     */
    Seats.prototype._loveSelectCall = function (loves) {
        let max_num = this._options.max_num
        if(this.options.maxMap.selectSeatCall) {
            let loves_copy = Object.assign([], loves)
            if(this.options.maxMap.maxSelectNum <= 0 && loves_copy[0].status === 0) {
                this.setAlertText('最多可选' + max_num + '个座位').showAlert()
                return
            }
            if(this.options.maxMap.maxSelectNum >= 2 && loves_copy[0].status === 0) {
                this.options.maxMap.maxSelectNum -= 2
                this.options.maxMap.selectSeatCall(loves_copy)
            } else if(loves_copy[0].status === 1) {
                this.options.maxMap.maxSelectNum += 2
                this.options.maxMap.selectSeatCall(loves_copy)
            }
        }
    }

    /**
     * @param item
     * @private
     */
    Seats.prototype._singleSelectCall = function (item) {
        let max_num = this._options.max_num
        if(this.options.maxMap.selectSeatCall) {
            if(item.status === 0 && this.options.maxMap.maxSelectNum <= 0) {
                this.setAlertText('最多可选' + max_num + '个座位').showAlert()
                return
            }
            if(this.options.maxMap.maxSelectNum >= 1 && item.status === 0) {
                this.options.maxMap.maxSelectNum -= 1
                item.status = 1
                this.options.maxMap.selectSeatCall([item])
            } else if(item.status === 1) {
                this.options.maxMap.maxSelectNum += 1
                item.status = 0
                this.options.maxMap.selectSeatCall([item])
            }
        }
    }

    /**
     * @param current
     * @param next
     * @private
     */
    Seats.prototype._selectLoveSeat = function (current, next) {
        let data = current
        if(current.x > next.x) {
            data = next
        }
        this._options.seatsData.filter(item => {
            if(data.key === item.key && data.y === item.y) {
                item.status = (item.status === 1 ? 0 : 1)
            }
            return item
        })
    }

    /**
     * @private
     */
    Seats.prototype._updateScreen = function () {
        let zoom = this._options._maxMap._zoom._current,
            all_w = this._options._maxMap.seatOptions.seatOverAllW,
            mid = this._options._maxMap._offset._mid,
            mid_w = (this._options._maxMap.seatOptions.xMax - this._options.diff_x )* mid
        let map_w = (all_w + mid_w) * zoom
        let t = (this._options._maxMap.screenW - map_w) / 2 - this._options._maxMap._offset.x + 2 * zoom
        this.options.maxMap.screen.el.style.transform = 'translateX('. concat(-Math.round(t) + mid, 'px)')
    }

    /**
     * @private
     */
    Seats.prototype._largePinchStart = function () {
        this._pan_option.first_dx = this._options._maxMap._offset.x
        this.hammer.get('pan').set({
            enable: false
        })
    }

    /**
     * @param data
     * @private
     */
    Seats.prototype._largePinchMove = function (data) {
        this._options._maxMap.isDrag = true
        let scale = this._options._maxMap._zoom._current * data.scale,
            min_scale = this._options._maxMap._zoom._min
        scale >= this._options._maxMap._zoom._max && (scale = this._options._maxMap._zoom._max)
        scale <= min_scale && (scale = min_scale)
        let n_x = data.center.x - this.options.maxMap.blank.left,
            n_y = data.center.y - this.options.maxMap.blank.top
        let r_x = parseInt(n_x / this._options._maxMap._zoom._current, 10),
            r_y = parseInt(n_y / this._options._maxMap._zoom._current, 10),
            scale_x = parseInt(n_x / scale, 10),
            scale_y = parseInt(n_y / scale, 10)
        this._options._maxMap._zoom._current = scale
        if(
            this._options._maxMap._offset.x - (r_x - scale_x) !== this._options._maxMap._offset.x
            || this._options._maxMap._offset.y - (r_y - scale_y)!== this._options._maxMap._offset.y
        ) {
            let x = this._options._maxMap._offset.x - (r_x - scale_x),
                y = this._options._maxMap._offset.y - (r_y - scale_y)
            this._setMapX(x)
            this._setMapY(y)
            this._boundary()
            this._setMapCenter()
            this._drawLeftSequence()
            this._leftSequenceMove(this._options._maxMap._offset.y)
            this.drawLargeMap()
            this._updateScreen()
        }
    }

    /**
     * @private
     */
    Seats.prototype._largePinchEnd = function () {
        setTimeout(() => {
            this.hammer.get('pan').set({
                enable: true
            })
        }, 300)
    }

    /**
     * @private
     */
    Seats.prototype._boundary = function () {
        let offset_y = this._options._maxMap._offset.y
        let offset_x = this._options._maxMap._offset.x,
            _diff_x = this._options.diff_x,
            _diff_y = this._options.diff_y,
            zoom = this._options._maxMap._zoom._current,
            mid = this._options._maxMap._offset._mid,
            left = this.options.maxMap.blank.left,
            right = this.options.maxMap.blank.right,
            x_max = this._options._maxMap.seatOptions.xMax - _diff_x,
            y_max = this._options._maxMap.seatOptions.yMax - _diff_y,
            first_x = this._options._maxMap._offset.first_x,
            all_w = this._options._maxMap.seatOptions.seatOverAllW,
            all_h = this._options._maxMap.seatOptions.seatOverAllH
        let total_h = all_h * zoom + y_max * mid
        let total_w = all_w * zoom + x_max * mid * zoom
        if(
            offset_y >= this.options.maxMap.blank.top
            || total_h + this.options.maxMap.blank.top <= this.canvasEl.height
        ) {
            offset_y = this.options.maxMap.blank.top
        } else {
            offset_y < this.canvasEl.height - total_h && (offset_y = this.canvasEl.height - total_h)
        }
        if(this.canvasEl.width >= total_w) {
            let s = (this.canvasEl.width - total_w) / 2
            offset_x !== s && (offset_x = first_x)
        } else {
            offset_x > 0 && (offset_x = this.options.maxMap.blank.left + mid)
            offset_x < this.canvasEl.width - total_w && (offset_x = this.canvasEl.width - total_w - left - right)
        }
        this._setMapY(offset_y)
        this._setMapX(offset_x)
        this._setMapCenter()
        this._drawLeftSequence()
        this._leftSequenceMove(offset_y)
        this.drawLargeMap()
        this._updateScreen()
    }

    /**
     * @private
     */
    Seats.prototype._largePanEnd = function () {
        this._boundary()
    }

    /**
     * @private
     */
    Seats.prototype._largePanStart = function () {
        this._pan_option = {
            startDx: this._options._maxMap._offset.x,
            startDy: this._options._maxMap._offset.y,
            first_dx: this._options._maxMap._offset.x
        }
    }

    /**
     * @type {{startDx: number}}
     * @private
     */
    Seats.prototype._pan_option = {
        startDx: 0,
        startDy: 0,
        first_dx: 0
    }

    /**
     * @param data
     * @private
     */
    Seats.prototype._largePanMove = function (data) {
        this._options._maxMap.isDrag = true
        let x = this._pan_option.startDx + data.deltaX,
            y = this._pan_option.startDy + data.deltaY
        this._setMapX(x)
        this._setMapY(y)
        this._setMapCenter()
        this.drawLargeMap()
        this._leftSequenceMove(y)
        this._updateScreen()
    }

    /**
     * @param y
     * @private
     */
    Seats.prototype._leftSequenceMove = function (y) {
        let container = this.options.maxMap.sequence
        container && container.el && (container.el.style.top = y + 'px')
    }

    /**
     * @param y
     * @private
     */
    Seats.prototype._setMapY = function (y) {
        this._options._maxMap._offset.y = y
    }

    /**
     * @param x
     * @private
     */
    Seats.prototype._setMapX = function (x) {
        this._options._maxMap._offset.x = x
    }

    /**
     * @constructor
     */
    Seats.prototype._setMapCenter = function () {
        let mid = this._options._maxMap._offset._mid,
            zoom = this._options._maxMap._zoom._current,
            is_drag = this._options._maxMap.isDrag,
            _diff_x = this._options.diff_x
        let mapW = this._options._maxMap.seatOptions.seatOverAllW + mid * (this._options._maxMap.seatOptions.xMax - _diff_x)
        let scaleW = mapW * zoom / 2
        this._options._maxMap.center.x = (scaleW + this._options._maxMap._offset.x) + (mid * zoom * (is_drag ? zoom : 1)) / 2
    }

    /**
     * @returns {{x: number, y: number}}
     * @constructor
     */
    Seats.prototype.GetMapCenter = function () {
        return this._options._maxMap.center
    }

    /**
     * @param data
     * @private
     */
    Seats.prototype._makeSeatData = function (data) {
        let list = []
        for (let i = 0; i < data.length; i++) {
            if(!list[data[i].y]) {
                list[data[i].y] = [data[i]]
            } else {
                list[data[i].y].push(data[i])
            }
        }
        let result = []
        for (const listKey in list) {
            result.push(...ArrayMultiSort(list[listKey], 'x', 'asc'))
        }
        this._options.seatsData = result
    }

    /**
     * @param text
     * @returns {Seats}
     */
    Seats.prototype.setAlertText = function (text) {
        if(this.options.alert_option.els && this.options.alert_option.els.span) {
            this.options.alert_option.els.span.innerText = text
        }
        return this
    }

    /**
     * @param src
     * @returns {Seats}
     */
    Seats.prototype.setAlertImage = function (src) {
        if(this.options.alert_option.els && this.options.alert_option.els.img) {
            this.options.alert_option.els.img.setAttribute('src', src)
        }
        return this
    }

    /**
     * @private
     */
    Seats.prototype._createdAlertNode = function () {
        if(!this.options.alert_option.is_show_alert) {
            return
        }
        let styles = {
            position: 'fixed',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '999',
            backgroundColor: this.options.alert_option.bg_color,
            borderRadius: '100px',
            padding: '4px 10px',
            display: 'flex',
            flexDirection: 'row',
            alignContent: 'center',
            flexWrap: 'nowrap',
            transition: 'top .2s ease'
        }
        let div = document.createElement('div'),
            span = document.createElement('span'),
            img = null
        for (const stylesKey in styles) {
            div.style[stylesKey] = styles[stylesKey]
        }
        span.style.fontSize = this.options.alert_option.fontSize
        span.style.color = this.options.alert_option.text_color
        span.style.lineHeight = '25px'
        span.innerText = this.options.alert_option.alert_text
        span.style.fontSize = this.options.alert_option.fontSize
        span.style.color = this.options.alert_option.text_color
        span.style.lineHeight = '25px'
        span.innerText = this.options.alert_option.alert_text
        if(this.options.alert_option.img_src) {
            span.style.paddingLeft = '6px'
            img = document.createElement('img')
            img.style.width = '25px'
            img.style.height = '25px'
            img.style.objectFit = 'cover'
            img.setAttribute('src', this.options.alert_option.img_src)
            div.appendChild(img)
        }
        div.appendChild(span)
        document.body.appendChild(div)
        this.options.alert_option.els = {
            div: div,
            span: span,
            img: img
        }
    }

    /**
     * @private
     */
    Seats.prototype.showAlert = function (color = '') {
        if(!this.options.alert_option.is_show_alert) {
            return
        }
        this.options.alert_option.els.div.style.top = '50px'
        if(color) {
            this.options.alert_option.els.div.style.backgroundColor = color
        }
        setTimeout(() => {
            this.options.alert_option.els.div.style.top = '40px'
        }, 200)
        setTimeout(() => {
            this.options.alert_option.els.div.style.transition = 'none'
            this.options.alert_option.els.div.style.top = '-50px'
            setTimeout(() => {
                this.options.alert_option.els.div.style.transition = 'top .2s ease'
                this.options.alert_option.els.div.style.backgroundColor = this.options.alert_option.bg_color
            }, 200)
        }, 3000)
    }

    /**
     * @param data
     * @returns {Seats}
     * @constructor
     */
    Seats.prototype.setSeatData = function (data) {
        if(!data) {
            throw new Error('setSeatData','Seat data is empty.')
        }
        if(!data instanceof Array) {
            throw new Error('setSeatData','Seat data is not an array.')
        }
        this._makeSeatData(data)
        this._calcSeat()
        this._drawLeftSequence()
        return this
    }

    /**
     * @type {{post: Seats.$.post, get: Seats.$.get, ajax: xhrHandle}}
     */
    Seats.prototype.$ = (function () {
        // 定义一些允许外界修改的值
        const propertys = [
            'abort',
            'error',
            'load',
            'loadend',
            'loadstart',
            'progress',
            'timeout',
            'success',
            'type',
            'async',
            'url',
            'data',
            'params',
            'contentType'
        ];

        /**
         * @description 请求的核心方法-原生
         * @param {*} [options={}]
         */
        function xhrHandle(options = {}) {
            // 设置请求类型，如果没有传请求类型，默认为get
            const type = options.type || 'get';

            // 是否时异步请求，默认为true，如果是同步请求，页面会在请求数据时假死
            const async = options.async || true;

            // 如果没有传请求地址，那就默认当前源为目标地址
            let url = options.url || location.origin;

            // 设置默认的请求类型
            let contentType = options.contentType || 'application/x-www-form-urlencoded';

            // data为post发送数据
            let data = undefined;
            if (contentType.indexOf('json') > -1 && options.data) {
                data = JSON.stringify(options.data);
            } else {
                data = buildParams(options.data);
            }
            if (options.params) {
                // 构建url参数或者表单数据
                url += '?' + buildParams(options.params);
            }
            // 实例化xhr对象
            let xhr = new XMLHttpRequest();
            // 遍历并快速赋值到我们xhr对象上，好处是不用一个一个赋值，坏处，需要控制好属性，不必要的属性也会添加到对象上
            for (let key of propertys) {
                xhr[key] = options[key];
            }

            // 发送请求前运行的函数
            options.beforeSend && options.beforeSend(xhr)

            // 发送header参数
            if(options.headers) {
                for (const headerKey in options.headers) {
                    xhr.setRequestHeader(headerKey, options.headers[headerKey])
                }
            }

            // 在xhr状态发生改变时进行我们success方法的业务执行
            xhr.onreadystatechange = function () {
                // readyState:4 表示资源下载完成
                // status:200 表示服务器返回正确
                if (xhr.readyState === 4 && xhr.status === 200) {
                    // 判断是否有success方法并执行
                    options.success && options.success(xhr.response);
                }
            };

            // 配置请求类型和目的地址
            xhr.open(type, url, async);
            // 设置请求头
            xhr.setRequestHeader('content-type', contentType);
            // 发送数据到服务端
            xhr.send(data);
        }

        /**
         * @description 构建params参数
         * @param {*} obj
         * @return {*}
         */
        function buildParams(obj) {
            let vs = [];
            for (let key in obj) {
                vs.push(key + '=' + obj[key]);
            }
            // 通过  &  符号合并数组的字段
            return vs.join('&');
        }

        return {
            /** ajax请求 */
            ajax: xhrHandle,
            /** post请求 */
            post: (url, data, success, contentType) => {
                xhrHandle({ type: 'post', url, data, success, contentType });
            },
            /** get请求 */
            get: (url, params, success) => {
                xhrHandle({ type: 'get', url, params, success });
            },
        };
    })()

    window.Seats = Seats;
})(window);
