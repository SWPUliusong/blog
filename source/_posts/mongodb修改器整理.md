---
title: mongodb修改器整理
date: 2017-12-15 11:20:40
tags: [mongodb, 数据库]
toc: true
---


## $inc
对文档的某个值为数字型（只能为满足要求的数字）的键进行增减的操作

例:
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "zhangsan", 
    "age" : 18, 
    "hobby" : [ "bb", "sb", "tt" ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$inc: {age: 2}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "zhangsan", 
    "age" : 20, 
    "hobby" : [ "bb", "sb", "tt" ] 
}
```

## $set
将指定的键值对更新到文档，不修改其他键

例:
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "zhangsan", 
    "age" : 20, 
    "hobby" : [ "bb", "sb", "tt" ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$set: {name: 'lisi'}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "age" : 20, 
    "hobby" : [ "bb", "sb", "tt" ] 
}
```

## $unset
删除文档的键，使用修改器$unset时，不论对目标键使用1、0、-1或者具体的字符串等都是可以删除该目标键

例:
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "age" : 20, 
    "hobby" : [ "bb", "sb", "tt" ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$unset: {age: 1}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"),
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ] 
}
```

## $push
向文档的某个数组类型的键添加一个数组元素，不过滤重复的数据。
- 添加时键存在，要求键值类型必须是数组；
- 键不存在，则创建数组类型的键

例:
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$push: {hobby: "s"}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt", "s" ] 
}
```

## $addToSet
主要给数组类型键值添加一个元素时，避免在数组中产生重复数据

例:
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt", "s" ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$addToSet: {hobby: "r"}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt", "s", "r" ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$addToSet: {hobby: "bb"}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 0 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt", "s", "r" ] 
}
```
## $pop
从数组的头或者尾删除数组中的元素  
- 从数组的尾部删除 1
- 从数组的尾部删除 0
- 从数组的头部 -1

例:
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt", "s", "r" ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$pop: {hobby: 1}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt", "s" ] 
}
```

## $pull
从数组中删除满足条件的元素

例:
```
> db.example.find()
{
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt", "s" ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$pull: {hobby: "s"}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ] 
}
```
## 数组的定位修改器
在需要对数组中的值进行操作的时候，可通过位置或者定位操作符（"$"）.数组是0开始的，可以直接将下标作为键来选择元素
- 若为多个文档满足条件，则只更新第一个文档。
- 定位符("$")代表查询条件匹配到的子文档位置

例：
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ], 
    "comments" : [ 
        { "count" : 10, "content" : "哈哈" }, 
        { "count" : 4, "content" : "嘻嘻" } 
    ] 
}
> db.example.update({"_id" : ObjectId("5a33646dbd1d4cc549a9938b")}, {$inc: {"comments.0.count": 1}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ], 
    "comments" : [ 
        { "count" : 11, "content" : "哈哈" }, 
        { "count" : 4, "content" : "嘻嘻" } 
    ] 
}
> db.example.update({"comments.count": 4}, {$set: {"comments.$.content": "呵呵"}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ], 
    "comments" : [ 
        { "count" : 11, "content" : "哈哈" }, 
        { "count" : 4, "content" : "呵呵" } 
    ]
}
```

## upsert	
- 布尔值
- update的第三个参数
- 为true时表示当没有符合条件的文档，就以这个条件和更新文档为基础创建一个新的文档，如果找到匹配的文档就正常的更新

例:
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ]
}
> db.example.update({"comments.count": 4}, {$set: {age: 20}}, {upsert: true})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ],
    "age" : 20 
}
```

## save函数
- 可以在文档不存在的时候插入，存在的时候更新，只有一个参数文档
- 要是文档含有"_id"，会调用upsert。否则，会调用插入

例：
```
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "lisi", 
    "hobby" : [ "bb", "sb", "tt" ], 
    "age" : 20 
}
> var data = db.example.findOne()
> data.name="张三"
张三
> db.example.save(data)
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.example.find()
{ 
    "_id" : ObjectId("5a33646dbd1d4cc549a9938b"), 
    "name" : "张三", 
    "hobby" : [ "bb", "sb", "tt" ], 
    "age" : 20
}
```