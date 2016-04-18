/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, {Component} from "react";
import ReactDOM from "react-dom";
import {RichUtils} from "draft-js";


class BlockButton extends Component {
  onClick(e) {
    e.preventDefault();
    this.props.onToggle(this.props.blockType.style);
  }

  render() {
    var style = {
      cursor: "pointer",
      display: "inline-block",
      padding: "5px"
    };
    return (
      <li style={style} onClick={::this.onClick}>
        {this.props.blockType.name}
      </li>
    );
  }
}

class BlockStyles extends Component {
  render() {
    const style = {
      listStyle: "none",
      display: this.props.open? "block": "none",
      position: "absolute",
      padding: 0,
      top: "25px",
      left: "-14px"
    };
    return (
      <ul style={style}>
        <BlockButton
          onToggle={::this.props.onToggle}
          blockType={{name: "IMG", style: "atomic"}} />
      </ul>
    );
  }
}

class PopOverMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleMouseOver() {
    this.setState({
      open: true
    });
  }

  handleMouseOut() {
    this.setState({
      open: false
    });
  }

  render() {
    return (
      <li
        style={{position: "relative"}}
        onMouseOver={::this.handleMouseOver}
        onMouseOut={::this.handleMouseOut}>
        +
        <BlockStyles
          open={this.state.open}
          onToggle={this.props.onToggle}/>
      </li>
    );
  }
}

function getSelectedBlockElement() {
  // Finds the block parent of the current selection
  // https://github.com/facebook/draft-js/issues/45
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return null;
  }
  var node = selection.getRangeAt(0).startContainer;

  do {
    if (node.getAttribute && node.getAttribute("data-block") == "true") {
      return node;
    }
    node = node.parentNode;
  } while (node != null);

}

export default class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {top: 0};
  }

  onToggle(blockType) {
    this.props.onChange(
      RichUtils.toggleBlockType(
        this.props.editorState,
        blockType
      )
    );
  }

  componentDidUpdate() {
    if (this.updatingPosition) {
      clearImmediate(this.updatingPosition);
    }
    this.updatingPosition = null ;
    this.updatingPosition = setImmediate(() => {
      return this.setBarPosition();
    });
  }

  setBarPosition() {
    const container = ReactDOM.findDOMNode(this.refs.container);

    const element = getSelectedBlockElement();

    if (!element) {
      return;
    }


    const top = Math.floor(
      element.getBoundingClientRect().top - 21 -
      (container.getBoundingClientRect().top -
        document.documentElement.clientTop));

    if (this.state.top !== top) {
      this.setState({
        top: top
      });
    }
  }

  render() {
    const style = {
      container: {
        cursor: "pointer",
        position: "relative"
      },
      popover: {
        position: "absolute",
        left: "-75px",
        float: "left",
        width: "75px",
        top: `${this.state.top}px`
      }
    };
    const {editorState} = this.props;

    return (
      <div ref="container" style={style.container}>
        <div style={style.popover}>
          <ul style={{listStyle: "none"}}>
            <PopOverMenu
              onToggle={::this.onToggle}/>
          </ul>
        </div>
      </div>
    );
  }
}
