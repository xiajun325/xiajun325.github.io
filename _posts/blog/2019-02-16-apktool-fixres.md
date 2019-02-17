---
layout: post
title:  反编译AndResGuard保护的apktool
categories: Crack
description: 对apktool进行修改，使其能反编译使用AndResGuard的app
keywords: AndResGuard,apktool, 反编译
---


## 概述   

最近反编译某信的时候，出现如下错误:

![wx-apktool-fail](../../../../images/blog/wx-apktool-fail.jpg)
也即是：
> <u> <font color=red> <i>Could not decode file, replacing by FALSE value: xxxxxx</u> </i></font>  

这个错误。这个错误二年以前就遇到过，当时研究了一下，修改下apktool就可以(**本文末附有修改的apktool的github下载链接**）。    

这篇文章，就说明记录下修改原理及过程，let's go!

## 分析 
通过分析apktool在反编译某信时的报错信息，发现是资源反编译出错，将某信的apk包直接解压，发现其结构如下：  
![wx-apktool-fail](../../../../images/blog/wx_pkg_struct.jpg)  

发现个奇怪的地方，资源文件都在r文件夹，而不是res文件夹，当时就觉得真牛，资源文件还可这么搞！
没办法，只好去研究下android的资源编译打包过程，找啊找，找啊找，找到如下文章：   

1. [Android应用程序资源的编译和打包过程分析](Android应用程序资源的编译和打包过程分析)  
2. [Android逆向之旅---解析编译之后的Resource.arsc文件格式](https://blog.csdn.net/jiangwei0910410003/article/details/50628894)   
 
> 顺便扯几句，这两篇文章的作者都是大神，写的很多文章都值得一读。

文章都很长，我就直接说重点:  

- apk包中的**resources.arsc**文件包含资源索引表，包括资源文件的相对路径，所以如果要将res改成r,只需要将resources.arsc 中的资源路径也相应改过来即可。  
看一下某信的resources.arsc：
![wx-apktool-fail](../../../../images/blog/wx_arsc.jpg)
的确将路径改成了 <i> r/xx </i> 的形式

- apk包中的xml文件会被编译成一种特定格式的文件，后缀还是xml.对于xml资源文件中定义或引用的资源(属性，图片），系统运行时是通过id而不是name去索引.也就是说，xml 中的name其实可以随便取名都不影响。   
看下某信中的某个编译后的xml资源文件：  
![wx-apktool-fail](../../../../images/blog/wx_res_xml_struct.jpg)
图中的name是个索引，指向真正的字符串名字，data就是resource id, 运行时根据id去索引表中查找资源。   
明白这两点后，就可以知道某信对资源做的改动了，也就是修改了resources.arsc 中的资源名字（名字中带相对路径）和实际的资源名字（带路径），但是 xml 中相应的资源名字没有改。
然后研究了下apktool 源码， 发现apktool 是直接通过xml中带路径的名字去查找资源，而不是通过id去resources.arsc 查名字。这样apktool是没法找到对应的资源的（因为实际资源路径都改了)     
知道原因后，就可以修改源码了，这里直接放出修改好的apktool jar 文件，源码可以反编译jar得到。  
修改后的apktool下载地址： <https://github.com/xiajun325/apktool-res-fix>  

> 后来发现某信使用的似乎是这个修改的资源：
[AndResGuard](https://github.com/shwenzhang/AndResGuard)

完！











