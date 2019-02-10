---
layout: post
title: 某信的二次打包
categories: Crack
description: 某信的二次打包
keywords: 微信,打包,破解,crack
---

对某信 6.5.3  版本 apk 进行重新打包（不能修改某信资源文件）
此文从我的简书迁移过来，简书文章请看
<https://www.jianshu.com/p/a0e6b3f15d78>

---


本文目的： 对某信 6.5.3  版本 apk 进行重新打包（不修改某信资源）

首先，直接上apktool ， 反编译后直接用  b 回编， 出现一大堆资源找不到的错误。老办法，上网查资料。看到这个:（该作者的其他微信系列研究文章很值得一看）

  

![](http://upload-images.jianshu.io/upload_images/1933828-a626d1b2491e30d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)  

文章大意就是微信apk 里有个 r 文件夹，里面有一些资源apktool 反编译时没有处理，似乎可以自己写程序处理，这个方法我没有尝试，因为我做的功能并不需要修改微信资源，不过感觉该作者所提供的方法是可行的。另，这个r 文件，是微信对资源进行了混淆，用的是它们已经开源的AndResGuard，AndResGuard 有个选项 keeproot, 可以更改资源路径。(res/x/x 改为 r /x/x)

我们继续， apktool 有个-r 选项，可以在反编译时不解码资源文件

-r,--no-res             Do not decode resources.

加上 -r 选项反编译微信，修改smald ， 生新用 apktool 打包， 签名，这次很ok , 然而安装后出现了不定时的闪退，哟，有保护啊 。咋办？还是老办法，网上查资料先，网上的资料说微信做了签名，dex 大小，修改时间校验等等。这样啊，于是又去研究代码，无数个夜晚之后，一无所获取。

  某天，脑袋里又闪过一道光，先把微信的打印打开，看看有没有啥有用的价值。综合网上的资料 ，在 com.tencent.mm.xlog.app  下 XLogSetup 这个类里发现下面这几行代码

函数： realSetupXlog

![](http://upload-images.jianshu.io/upload_images/1933828-512640dc2466e076.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)  

直接将 setConsoleLogOpen 的参数改为true, 重新打包，log  有了， crash 部分如下:  

  

![](http://upload-images.jianshu.io/upload_images/1933828-69b013200dfbf3a4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)  

这看的我一头雾水，挂在native 层， 又是无数个夜晚跟尝试，又是一无所获。

终于，光在某一天又来了，在log 里发现了这两行：

  

![](http://upload-images.jianshu.io/upload_images/1933828-5424801fea27aafd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)  

odex  校验不过，在网上下载dalivk 源码，查找发现，在源码中发 dvmCheckOptHeaderAndDependencies 这个函数中有这个打印：

  

![](http://upload-images.jianshu.io/upload_images/1933828-38c03c4807a88390.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)  

从手机上pull 下 /system/lib/libdvm.so , 用ida 打开，找到这个函数， 将 if 验证去掉，然后push 回 手机， 再运行修改后的app， 一切正常。看来就是这个验证不过导致的。（网上传闻的啥签名校验等等都没遇到，不知道是咋回事）。

又是几个夜晚的查资料， 研究dex, 发现这个modwhen 可能就是生成odex 的源 dex 的修改时间，那就写个程序吧，在生成odex 后，把 dex 的修改时间改成跟modwhen 一样看行不行。 微信启动后，会把 dex 从apk 中解压出来，放在/data/data/com.tencent.mm/app\_dex  目录中， 而生成的odex 放在 /data/data/com.tencent.mm/app\_cache 中。

写好修改mod程序后，反复实验 ，并不行。app_dex 下的classesX.dex 文件似乎一直在变，于是又跑去看它是怎么加载dex 的, 发现了这个:

  

![](http://upload-images.jianshu.io/upload_images/1933828-0defec53bdf8af58.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)  

这个是对dex 进行 md5  校验，如果通不过，就会不断的从apk 中解出dex 文件覆盖app_dex 下的dex 文件，怪不得这个修改时间一直在变。改代码，去掉检验，一切ok.

过程还是很艰辛的，高估了微信的防止二次打包的技术，以至于走了不少弯路。

微信对二次打包并没有做过多的防范措施，仅仅有个资源混淆和dex  md5 校验。

但是:微信的反动态调试做得不错，无论是调smali 还是so  我都是调一会儿就断了，这块有空再研究。

完。