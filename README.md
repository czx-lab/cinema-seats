# Seat map js sdk

电影座位图js-sdk,支持智能选座、可放大缩小、可拖拽、回弹，适用于电影座位图快速渲染、智能推荐选座等场景

适用于小程序端与h5

### 座位seats.js使用文档说明

---

#### [点击加群交流反馈：776392988](https://jq.qq.com/?_wv=1027&k=KM7uPstF)

---

#### 说明

>需要注意的是，因为项目中使用到了`hammer.js`，然而在微信小程序中原生没有直接提供多点触控、app端nvue下使用canvas需要引入gcanvas，基于各种原因，最后选择使用web-view加载外部资源。

#### 依赖

>seats.js中使用到手势，所以需要在项目中引入 `hammer.js`

>hammer地址：[hammer.js](https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.js)


#### Example
```js
// 一个简单例子，具体使用看下面说明文档，或者下载实例看里面的具体使用方法
// new Seats(canvas-el, options)

let map = new Seats(canvas, {
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
        line: {
            best_color: '#F00',
            center_color: '#c8c8c8'
        },
        blank: {
            left: 10,
            right: 10,
            top: 20
        },
        maxSelectNum: 4,
        selectSeatCall: (data) => {
            
        }
    }
})

// 设置座位数据和座位图背景 
map.setSeatData([]).setBackground()

// 绘制座位图
map.drawLargeMap()
```

#### options
```
{
    // 弹窗相关设置
    alert_option: {
        // 弹窗信息，也可以通过methods中的setAlertText()设置信息
        alert_text: '非常棒最佳观影区位置~',
        // 弹窗图片，也可以通过methods中的setAlertImage()设置信息
        img_src: 'good_bg.png',
        // 弹窗背景颜色，可主动调用showAlert(color = '')并设置颜色
        bg_color: '#ff9800',
        // 字体颜色
        text_color: '#fff',
        // 字体大小
        fontSize: '12px',
        // 是否显示弹窗
        is_show_alert: false
    },
    // 座位图选项
    maxMap: {
        // 座位图片选项
        image_option: {
             // 情侣座图片宽高
             love: {
                w: 152,
                h: 64
             },
             // 非情侣座图片宽高
             normal: {
                w: 68,
                h: 64
             }
        },
        // 侧边数字标记选项
        sequence: {
            // 元素节点
            el: null,
            // 元素样式
            style: {}
        },
        // 屏幕选项
        screen: {
            el: null
        },
        // 线条选项
        line: {
            // 最佳观影位置线条颜色
            best_color: '#F00',
            // 中间线颜色
            center_color: '#c8c8c8'
        },
        // 座位图留白
        blank: {
            // 左边空白
            left: 10,
            // 右边空白
            right: 10,
            // 顶部空白
            top: 20
        },
        // 最大选座数量
        maxSelectNum: 0,
        // 选座回调, data座位数据【type: Array】
        selectSeatCall: (data) => {
        }
    }
}
```

#### methods

- 设置座位背景图：`map.setBackground(params = {})`

```js
params = {
    un_set: 'xxx',
    un_love: 'xxx',
    set: 'xxx',
    love: 'xxx',
    sold_love: 'xxx',
    sold: 'xxx',
    mend: 'xxx',
    love_mend: 'xxx'
}
```

> 背景图选项：
>
> `un_set`: 非情侣座位可选图片
>
> `un_love`:情侣座位可选图片
>
> `set`: 非情侣座位已选图片
>
> `love`: 情侣座位已选图片
>
> `sold_love`: 情侣座已售图片
>
> `sold`: 非情侣座已售图片
>
> `mend`: 非情侣座正在维护图片
>
> `love_mend`: 情侣座正在维护图片

- 设置座位数据: `map.setSeatData(data = [])`

```js
data = [
    {
        x: 1, 
        y: 1,
        status: 0, 
        type: 0,
        is_best: 0,
        key: 'love_key'
    }
]
```

>设置座位数据参数：
>
> `data`: 座位数据选项
>
> data内部数据说明：
>
> `x`: x坐标
>
> `y`: y坐标
>
> `status`: 座位状态【0：可选， 1： 已选， 2： 已售】
>
> `type`: 座位类型【0：情侣座， 1：非情侣座】
>
> `is_best`: 是否最佳观影位【0：否 1：是】
>
> `key`: 当座位类型为情侣座时，key为必选，且两个情侣座位的key相同

- 绘制座位图：`map.drawLargeMap()`
- 设置弹窗提示内容：`map.setAlertText(text = '')`
> 参数说明：
>
> `text`:提示内容

- 设置弹窗图片：`map.setAlertImage(src = '')`
> 参数说明：
>
> `src`:弹窗图片地址

- 显示弹窗：`map.showAlert(color = '')`
> 参数说明：
>
> `color`:弹窗背景颜色
>
> 注意：弹窗相关可以链式调用`map.setAlertText('测试').setAlertImage('img/good_bg.png').showAlert('red)`

- 推荐座位：`map.recSeatHandler(num = 0)`
>推荐座位参数：
>
> `num`: 推荐座位数量

- 移除已选座位: `map.closeSeatHandler({x: 0, y: 0})`
>移除已选座位参数：
>
> `x`: x坐标
>
> `y`: y坐标

- request请求: `map.$.ajax(options = {})`
- post请求: `map.$.post(url, data, success, contentType)`
- get请求: `map.$.get(url, params, success)`
> 与ajax用法类似

---

#### 扫描下面二维码预览
![示例预览二维码](https://cinema-media.oss-cn-chengdu.aliyuncs.com/image/hCwRhifEi5C67syrtXQEZshhXmCzpcJM.png)

---

#### 下一版本更新说明

- 增加已售座位背景图为多图，并随机显示
- 自定义座位图座位大小
- 增加vip座位图设置


