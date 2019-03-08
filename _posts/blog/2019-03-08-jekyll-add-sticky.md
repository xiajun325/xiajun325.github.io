---
layout: post
title:  jkeyll加入文章置顶功能
categories: jekyll
description: jkeyll加入文章置顶功能
keywords: jkeyll 置顶 
---


## jkeyll加入文章置顶功能
方法有两种，都需要加入新的属性表明是否需要置顶，假设属性名为 sticky, 值为为true即表明置顶，没有这个属性表明不置顶。   

  -  方法一遍历所有文章，先显示有*sticky*的文章。再遍历一次所有文章，显示没有*sticky*的文章，Liquid 代码如下：    
  
  		{* for post in paginator.posts *}
        {* if post.sticky != true *}
         .....
        {* endif *}
        {* endfor *}
         {* for post in paginator.posts *}
         {* if post.sticky != true *}
         .....
         {* endif *}
         {* endfor *}
 			
  -  方法二对所有文章排序，将有*sticky*的文章排在最前面,Liquid 代码如下：

  		{* assign sorted_posts = paginator.posts | sort:"sticky"  | reverse *}
  		{* for post in sorted_posts *}
         .....       
        {* endif *}
        {* endfor *}   



    
        
        
        
        
        
       
       
       
  







