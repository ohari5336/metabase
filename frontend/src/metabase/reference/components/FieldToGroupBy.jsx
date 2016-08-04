import React, { Component, PropTypes } from "react";
import { Link } from "react-router";
import pure from "recompose/pure";
import cx from "classnames";

import S from "./FieldToGroupBy.css";
import Q from "metabase/components/QueryButton.css";

import Icon from "metabase/components/Icon.jsx";

const FieldToGroupBy = ({
    className,
    metric,
    field,
    icon,
    iconClass,
    onClick,
    secondaryOnClick,
}) => 
    <div className={className}>
        <span className={Q.queryButton} onClick={onClick}>
            <span className={S.fieldToGroupByText}>
                <span>
                    {`${metric.name} by `}
                </span>
                <span className="ml1 text-brand">
                    {field.name}
                </span>
            </span>
            <Icon 
                className={iconClass} 
                size={20} 
                name="reference"
            />
        </span>
    </div>;
FieldToGroupBy.propTypes = {
    className: PropTypes.string,
    metric: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    iconClass: PropTypes.string,
    onClick: PropTypes.func,
    secondaryOnClick: PropTypes.func
};

export default pure(FieldToGroupBy);