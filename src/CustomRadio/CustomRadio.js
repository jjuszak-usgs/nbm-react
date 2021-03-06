import React from 'react'
import { Glyphicon } from "react-bootstrap";

import "./CustomRadio.css"


class RadioButton extends React.Component {
    handleClick(){
        this.props.handler(this.props.index, this.props.value);
    }

    render() {
        return (
            <div onClick={this.handleClick.bind(this)}>
                <Glyphicon
                    style={{textAlign: "right", justifyContent: "center"}}
                    className="nbm-flex-column"
                    glyph={this.props.isChecked ? "check" : "unchecked"}
                />
            </div>
        )
    }
}

class Radio extends React.Component{

    render() {
        return (
            <div>
                <div className="nbm-flex-row-no-padding radio-option">
                    <span className="nbm-flex-column-big">{this.props.text}</span>
                    <RadioButton
                        handler={this.props.handler}
                        isChecked={this.props.isChecked}
                        index={this.props.index}
                    />
                </div>
            </div>
        );
    }
}

class RadioGroup extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0,
            selectedValue: null,
            options: props.options,
            canDeselect: props.canDeselect
        };
    }

    toggleRadioBtn(index){
        if (this.state.selectedIndex === index && this.state.canDeselect) {
            this.setState({
                selectedIndex: null,
                selectedValue: null,
                options: this.state.options
            });
            this.props.onChange(null)
        } else {
            this.setState({
                selectedIndex: index,
                selectedValue: this.state.options[index],
                options: this.state.options
            });
            this.props.onChange(this.state.options[index])
        }
    }

    render() {

        const { options } = this.state;

        const allOptions = options.map((option, i) => {
            return (
                <div key={i}>
                    <Radio
                        isChecked={(this.state.selectedIndex === i)}
                        text={option.title}
                        value={option.title}
                        index={i}
                        handler={this.toggleRadioBtn.bind(this)} />
                </div>
            )
        });

        return (
            <div>{allOptions}</div>
        );
    }
}

export {
    RadioGroup,
    Radio,
    RadioButton
}
