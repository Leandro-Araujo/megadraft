/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, {Component} from "react";
import {RichUtils} from "draft-js";
import ToolbarItem from "./ToolbarItem";

import {getSelectionCoords} from "./utils";


export default class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  toggleInlineStyle(inlineStyle) {
    const newEditorState = RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle);
    this.props.onChange(newEditorState);
  }

  toggleBlockStyle(blockType) {
    this.props.onChange(
      RichUtils.toggleBlockType(this.props.editorState, blockType)
    );
  }

  rawStyle() {
    return {__html: `
      .draft-toolbar {
        background-color: #181818;
        border-radius: 4px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
        position: absolute;
        white-space: nowrap;
      }
      .draft-toolbar:after {
        display: inline-block;
        top: 100%;
        left: 50%;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        border: solid transparent;
        border-top-color: #181818;
        border-width: 8px;
        margin-left: -8px;
      }
      .draft-toolbar ul {
        padding: 0 8px;
        margin: 0;
      }
      .draft-toolbar .item {
        display: inline-block;
      }
      .draft-toolbar .item button {
        padding: 0;
        color: #ccc;
        cursor: pointer;
        border: 0;
        height: 56px;
        width: 40px;
        background: transparent;
      }
      .draft-toolbar .item.active button:hover,
      .draft-toolbar .item.active button {
        color: #3192e7;
      }
      .draft-toolbar .item button:hover {
        color: #fff;
      }
      .draft-toolbar .separator {
        border-right: 1px solid #333;
        height: 20px;
        margin: 0 8px;
      }
      `
    };
  }

  renderButton(item, position) {
    let current = null;
    let toggle = null;
    let active = null;
    let key = item.label;

    switch(item.type) {
      case "inline": {
        current = this.props.editorState.getCurrentInlineStyle();
        toggle = () => this.toggleInlineStyle(item.style);
        active = current.has(item.style);
        break;
      }
      case "block": {
        const selection = this.props.editorState.getSelection();
        current = this.props.editorState
          .getCurrentContent()
          .getBlockForKey(selection.getStartKey())
          .getType();
        toggle = () => this.toggleBlockStyle(item.style);
        active = item.style === current;
        break;
      }
      case "separator": {
        key = "sep-" + position;
        break;
      }
    }

    return (
      <ToolbarItem key={key} active={active} toggle={toggle} item={item} />
    );
  }

  setBarPosition() {
    const editor = this.props.editor;
    const toolbar = this.refs.toolbar;
    const selectionCoords = getSelectionCoords(editor, toolbar);

    if (!this.state.position ||
        this.state.position.top !== selectionCoords.offsetTop ||
        this.state.position.left !== selectionCoords.offsetLeft) {
      this.setState({
        show: true,
        position: {
          top: selectionCoords.offsetTop,
          left: selectionCoords.offsetLeft
        }
      });
    }
  }

  componentDidUpdate() {
    if (!this.props.editorState.getSelection().isCollapsed() &&
        this.props.editorState.getSelection().getHasFocus()) {
      return this.setBarPosition();
    } else {
      if (this.state.show) {
        this.setState({show: false});
      }
    }
  }

  render() {
    var style = this.state.position || {};

    if (!this.state.show) {
      style = {...style, display: "none"};
    }

    return (
      <div
        className="draft-toolbar"
        style={style}
        ref="toolbar"
        onMouseDown={(x) => {x.preventDefault();}}>
        <style dangerouslySetInnerHTML={this.rawStyle()}></style>
        <ul>
          {this.props.actions.map(::this.renderButton)}
        </ul>
      </div>
    );
  }
}