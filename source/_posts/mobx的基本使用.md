---
title: mobx的基本使用
date: 2018-01-04 11:09:48
tags: [react, mobx]
---

### 前言
我们知道react的组件是类似于树一样的结构,数据只能单向的由上向下传递,当组件树越来越复杂时,状态传递的层级会越来越深,整个应用也会变得非常杂乱.这时就需要引入状态管理工具,一般来说,redux和mobx都是比较好的选择,但是就初步接触的体验来说,个人更喜欢mobx

<!-- more -->

## mobx的基本概念
mobx的核心api很少
- observable: 将数据定义为可被观测的,mobx会跟踪值的变化
- computed: 当依赖关系变化时,mobx会重新计算该值
- autorun: 当它的依赖关系改变时会被触发
- action: 对状态的修改动作(一般可省略,严格模式强制要求使用)
- observer: mobx-react里的api,将mobx的store映射到组件的state

一般来说,基本工作流程-官方的图![](http://cn.mobx.js.org/flow.png)
下面我们来写一个常见的todo list的例子

## todo list例子

### 创建项目
```
> npm install -g create-react-app       // 安装create-react-app

> create-react-app todo-list           // 创建项目

> cd todo-list

> npm start
```
由于我们要用到ES7的装饰器,所以我们必须自己配置下webpack配置文件,之前是看不到webpack文件的,因为create-react-app自己管理了这个配置
```
> npm run eject     // 退出这种模式,使配置文件都显示出来
> npm i --save-dev babel-plugin-transform-decorators-legacy     // 安装插件
```
修改webpack的配置文件
```javascript
{
    test: /\.(js|jsx|mjs)$/,
    include: paths.appSrc,
    loader: require.resolve('babel-loader'),
    options: {
        
        compact: true,
        // 添加这一句
        plugins: ["transform-decorators-legacy"]
    },
},
```

### 定义store
```javascript
import { observable, computed, action, autorun } from "mobx"

let originId = 0
class Todo {
    id = originId++
    @observable completed = false

    constructor(text) {
        this.text = text
        
        // 内部依赖this的text,当它变化时会触发该autorun
        autorun(() => {
            console.log(`添加了一条todo项: ${this.text}`)
        })

        // 内部依赖this的completed和text,当它们变化时会触发该autorun
        autorun(() => {
            if (this.completed) {
                console.log(`完成了一条todo项: ${this.text}`)
            }
        })
    }
}

// 过滤策略
const filterWays = {
    ALL(todos) {
        return todos.filter(todo => true)
    },
    ACTIVE(todos) {
        return todos.filter(todo => !todo.completed)
    },
    COMPLETED(todos) {
        return todos.filter(todo => todo.completed)
    }
}

// 过滤方式
export const filters = Object.keys(filterWays)

export class TodosStore {
    @observable todos = []
    @observable filter = filters[0]
    
    @action add(text) {
        this.todos.push(new Todo(text))
    }

    @computed get list() {
        const filterWay = filterWays[this.filter]

        if (!filterWay) return this.todos

        return filterWay(this.todos)
    }
}

export const todosStore = new TodosStore()
```

### 定义组件
划分组件为三个部分
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fn4pk26zwkj30dr06eaa2.jpg)

App.js
```javascript
import React, { Component } from 'react'
import { AddTodo } from "./components/AddTodo"
import { ShowTodos } from "./components/ShowTodos"
import { Filter } from "./components/Filter"

import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <AddTodo />
        <ShowTodos />
        <Filter />
      </div>
    );
  }
}

export default App;
```

AddTodo.js
```javascript
import React from "react"
import { observer } from "mobx-react"
import { todosStore } from "../stores"

@observer
export class AddTodo extends React.Component {
    render() {
        return (
            <form onSubmit={e => this.submit(e)}>
                <input type="text" 
                ref={node => this.input = node} />
                <button type="submit">添加</button>
            </form>
        )
    }

    submit(e) {
        e.preventDefault()
        if (!this.input.value) return
        todosStore.add(this.input.value)
        this.input.value = ""
    }
}
```

ShowTodos.js
```javascript
import React from "react"
import { observer } from "mobx-react"
import { todosStore } from "../stores"

@observer
export class ShowTodos extends React.Component {
    render() {
        return (
            <ul>
                {
                    todosStore.list.map(todo => (
                        <li style={this.isCompleted(todo.completed)}
                            key={todo.id}
                            onClick={() => this.clickHandle(todo)}>
                            {todo.text}
                        </li>
                    ))
                }
            </ul>
        )
    }

    clickHandle(todo) {
        todo.completed = !todo.completed
    }

    isCompleted(completed) {
        if (completed) {
            return { textDecoration: "line-through" }
        } else {
            return { textDecoration: "none" }
        }
    }
}
```

Filter.js
```javascript
import React from "react"
import { observer } from "mobx-react"
import { todosStore, filters } from "../stores"

@observer
export class Filter extends React.Component {
    render() {
        return (
            <p className="filter">
                Filter:
                {
                    filters.map(filter => (
                        <span key={filter}
                            style={this.isChecked(filter)}
                            onClick={() => this.clickHandle(filter)}>{filter}
                        </span>
                    ))
                }
            </p>
        )
    }

    clickHandle(filter) {
        todosStore.filter = filter
    }

    isChecked(key) {
        if (todosStore.filter === key) {
            return { color: "blue", textDecoration: "none" }
        }
    }
}
```

### 最终效果
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fn4p3qvyvgg317w0lwt9k.jpg)
代码地址: [react-todo-list](https://github.com/SWPUliusong/coding-play/tree/master/react-todo-list)

> 