---
title: mongodb条件查询符整理
date: 2017-12-18 12:13:45
tags: [mongodb, 数据库]
toc: true
---

## $lt $lte $gt $gte $ne
| 条件符|对应值|
| ----- |:----:|
| $lt	|  <   |
| $lte	|  <=  |
| $gt   |  >   |
| $gte	|  >=  |
| $ne	|  !=  |

<!-- more -->

## $in $nin $all
- $in 文档字段值与数组某个元素匹配
- $nin 文档字段值不与数组任意元素匹配
- $all 所有元素要与文档匹配
```
> db.col.find({age:{$in:[11,22]}})
> db.col.find({age:{$nin:[11,22]}})
> db.col.find({ Released:{$all:["2010","2009"]}})
```

## $or $and $nor
- $or 或操作,满足其一
- $and 与操作,满足全部条件
- $nor 所列条件全部不满足
```
> db.col.find({$or:[{age:11},{age:22}]})
> db.col.find({$and:[{age:11},{name:"xxx"}]})
> db.col.find({$nor:[{age:11},{name:"xxx"}]})
```

## $not $mod
- $not与正则表达式联合使用时极为有效，用来查找那些与特定模式不匹配的文档。
- $mod会将查询的值除以第一个给定的值，若余数等于第二个给定的值，则返回该结果。
```
> db.col.find({age:{$mod:[11,0]}})
> db.col.find({age:{$not:{$mod:[11,0]}}})
```

## $slice
相当于数组函数的切片,值可以是int或者[]int
- int: 表示要返回的元素总数.正数从集合头部开始返回;负数从尾部
- []int: 第一个参数定义的是偏移量，而第二个参数是限定的个数(同上)
```
> db.mediaCollection.find({"Title" : "Matrix, The"}).toArray()
[
    {
        "_id" : ObjectId("53548225d85b463e729a2e57"),
        "Type" : "DVD",
        "Title" : "Matrix, The",
        "Released" : 1999,
        "Cast" : [
            "Keanu Reeves",
            "Carry-Anne Moss",
            "Laurence Fishburne",
            "Hugo Weaving",
            "Gloria Foster",
            "Joe Pantoliano"
        ]
    }
]
> db.mediaCollection.find({"Title" : "Matrix, The"}, {"Cast" : {$slice: 3}}).toArray()
[
    {
        "_id" : ObjectId("53548225d85b463e729a2e57"),
        "Type" : "DVD",
        "Title" : "Matrix, The",
        "Released" : 1999,
        "Cast" : [
            "Keanu Reeves",
            "Carry-Anne Moss",
            "Laurence Fishburne"
        ]
    }
]
> db.mediaCollection.find({"Title" : "Matrix, The"}, {"Cast" : {$slice: -3}}).toArray()
[
    {
        "_id" : ObjectId("53548225d85b463e729a2e57"),
        "Type" : "DVD",
        "Title" : "Matrix, The",
        "Released" : 1999,
        "Cast" : [
            "Hugo Weaving",
            "Gloria Foster",
            "Joe Pantoliano"
        ]
    }
]
> db.mediaCollection.find({"Title" : "Matrix, The"}, {"Cast" : {$slice: [2,3] }}).toArray()
[
    {
        "_id" : ObjectId("53548225d85b463e729a2e57"),
        "Type" : "DVD",
        "Title" : "Matrix, The",
        "Released" : 1999,
        "Cast" : [
            "Laurence Fishburne",
            "Hugo Weaving",
            "Gloria Foster"
        ]
    }
]
> db.mediaCollection.find({"Title" : "Matrix, The"}, {"Cast" : {$slice: [-5,4] }}).toArray()
[
    {
        "_id" : ObjectId("53548225d85b463e729a2e57"),
        "Type" : "DVD",
        "Title" : "Matrix, The",
        "Released" : 1999,
        "Cast" : [
            "Carry-Anne Moss",
            "Laurence Fishburne",
            "Hugo Weaving",
            "Gloria Foster"
        ]
    }
]
```

## $size
对结果进行筛选，匹配指定的元素数的数组。
```
> db.mediaCollection.find( { Tracklist : {$size : 2} } ).toArray()
[
    {
        "_id" : ObjectId("5353463193efef02c962da73"),
        "Type" : "CD",
        "Artist" : "Nirvana",
        "Title" : "Nevermind",
        "Tracklist" : [
            {
                "Track" : "1",
                "Title" : "Smells like teen spirit",
                "Length" : "5:02"
            },
            {
                "Track" : "2",
                "Title" : "In Bloom",
                "Length" : "4:15"
            }
        ]
    }
]
> db.mediaCollection.find( { Cast : {$size : 1} } ).toArray()
[ ]
> db.mediaCollection.find( { Cast : {$size : 6} } ).toArray()
[
    {
        "_id" : ObjectId("53548225d85b463e729a2e57"),
        "Type" : "DVD",
        "Title" : "Matrix, The",
        "Released" : 1999,
        "Cast" : [
            "Keanu Reeves",
            "Carry-Anne Moss",
            "Laurence Fishburne",
            "Hugo Weaving",
            "Gloria Foster",
            "Joe Pantoliano"
        ]
    }
]
```

## $exists
- 布尔值
- 筛选文档字段是否存在
```
> db.mediaCollection.find( { Author : {$exists : true } } ).toArray()
[
    {
        "_id" : ObjectId("5353462f93efef02c962da71"),
        "Type" : "Book",
        "Title" : "Definitive Guide to MongoDB, the",
        "ISBN" : "987-1-4302-3051-9",
        "Publisher" : "Apress",
        "Author" : [
            "Membrey, Peter",
            "Plugge, Eelco",
            "Hawkins, Tim"
        ]
    }
]
```

## $type
基于BSON类型来匹配结果

| 类型描述                      | 类型值 |
| ----------------------------- |:------:|
| Double                        |   1    |
| String		                |	2    | 
| Object		                |	3    | 
| Array		                    |	4    |
| Binary data	                |	5    | 
| Object id	                    |	7    |
| Boolean		                |	8    |
| Date		                    |	9    |
| Null		                    |	10   |
| Regular expression	        | 	11   |
| JavaScript code	            |   13   |
| Symbol		                | 	14   |
| JavaScript code with scope    | 	15   |
| 32-bit integer	            | 	16   |
| Timestamp		                | 	17   |
| 64-bit integer	            | 	18   |
| Min key		                | 	255  |
| Max key		                | 	127  |

```
> db.mediaCollection.find ( { Tracklist: { $type : 3 } } ).toArray()
[
    {
        "_id" : ObjectId("5353463193efef02c962da73"),
        "Type" : "CD",
        "Artist" : "Nirvana",
        "Title" : "Nevermind",
        "Tracklist" : [
            {
                "Track" : "1",
                "Title" : "Smells like teen spirit",
                "Length" : "5:02"
            },
            {
                "Track" : "2",
                "Title" : "In Bloom",
                "Length" : "4:15"
            }
        ]
    }
]
```

> 原帖地址http://www.ttlsa.com/mongodb/mongodb-conditional-operators/