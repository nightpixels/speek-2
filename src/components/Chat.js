import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import store from '../store'
import { observer } from 'mobx-react'
import _ from 'lodash'
import db from '../db'
import Message from './Message'
import botListener from '../utils/bot'
import auth from '../utils/auth'
import moment from 'frozen-moment'
const title = document.title
let count = 0

@observer
class Chat extends Component {
  // Submit message
  _submit = (e) => {
    e.preventDefault()
    const message = this.refs.message.value
    if (message.length > 0) {
      store.time = moment().format('dddd[,] h:mmA')
      store.username = store.calledBot ? 'SpeekBot' : store.username
      store.addMessage(message, store.time)
      botListener(message, store.time)
      this.changeTitle()
    }
    this.refs.message.value = ''
  }
  // Delete username
  logout = () => {
    store.announceUser(`@${store.username} has left`)
    console.log(`@${store.username} has logged out`)
    auth.signOut()
    store.username = null
    window.localStorage.removeItem('username')
    this.props.history.push('/')
  }

// Detects the height when DOM renders
// Scrolls to bottom of container to
// display latest message
  componentDidMount () {
    const element = this.refs.chatbox
    element.scrollTop = element.scrollHeight
  }

  componentDidUpdate () {
    const element = this.refs.chatbox
    element.scrollTop = element.scrollHeight
  }

// Quick way to clear chat, just create a button and call this.delete
  delete () {
    db.ref('messages').remove()
  }

  changeTitle () {
    count++
    store.update = count
    let newTitle = `(${count}) ${title}`
    document.title = newTitle
  }

  resetUpdateCount = () => {
    count = 0
    store.update = count
    let newTitle = `${title}`
    document.title = newTitle
  }

  render () {
    const localUserName = window.localStorage.username
    if (localUserName) {
      // const likes = store.likes
      return <div className='Chat'>
        <div className='chatContainer'>
          <div className='clearMessages'>
            <button className={store.username === 'James' ? '' : 'hidden'}
              onClick={this.delete}>
              Del
            </button>
            <button onClick={this.logout}>logout</button>
          </div>
          <div className='mainContainer' ref='chatbox' onClick={this.resetUpdateCount}>
            <div className='chatTextBox'>
              {_.map(store.messages, ({ username, message, text, time }, key) => {
                return <div className='chatMessage' key={key}>
                  <Message remove={this.delete} username={username} text={text} time={time} />
                </div>
                // console.log(bot + message)
              })}
            </div>
          </div>
        </div>
        <div className='inputContainer'>
          <form className='chatform' onSubmit={this._submit}>
            <input className='inputBox' ref='message' placeholder={'@' + `${localUserName}`} />
            <button className='chatSubmit' onSubmit={this._submit}><i className='fa fa-send' /></button>
          </form>
        </div>
      </div>
    } else {
      return <Redirect to='/' />
    }
  }
}

export default Chat
