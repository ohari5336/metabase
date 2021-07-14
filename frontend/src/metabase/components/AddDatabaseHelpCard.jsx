import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { t, jt } from "ttag";

import MetabaseSettings from "metabase/lib/settings";

import ExternalLink from "metabase/components/ExternalLink";
import Icon from "metabase/components/Icon";

// TODO: is this really the best way?
import { allEngines, engineSupersedesMap } from "../entities/databases/forms";

import {
  CardContent,
  HelpCardContainer,
  IconContainer,
} from "./AddDatabaseHelpCard.styled";
import Warnings from "metabase/query_builder/components/Warnings";

export const ENGINE_DOCS = {
  bigquery: MetabaseSettings.docsUrl("administration-guide/databases/bigquery"),
  mongo: MetabaseSettings.docsUrl("administration-guide/databases/mongodb"),
  mysql: MetabaseSettings.docsUrl("administration-guide/databases/mysql"),
  oracle: MetabaseSettings.docsUrl("administration-guide/databases/oracle"),
  snowflake: MetabaseSettings.docsUrl(
    "administration-guide/databases/snowflake",
  ),
  vertica: MetabaseSettings.docsUrl("administration-guide/databases/vertica"),
};

export const GENERAL_DB_DOC = MetabaseSettings.docsUrl(
  "administration-guide/01-managing-databases",
);

export const CLOUD_HELP_URL = "https://www.metabase.com/help/cloud";

const propTypes = {
  engine: PropTypes.string.isRequired,
  hasCircle: PropTypes.bool,
};

function AddDatabaseHelpCard({ engine, hasCircle = true, ...props }) {
  const displayName = useMemo(() => {
    const hasEngineDoc = !!ENGINE_DOCS[engine];
    if (!hasEngineDoc) {
      return "your database";
    }
    const engines = MetabaseSettings.get("engines");
    return (engines[engine] || {})["driver-name"];
  }, [engine]);

  const docsLink = ENGINE_DOCS[engine] || GENERAL_DB_DOC;
  const shouldDisplayHelpLink = MetabaseSettings.isHosted();

  const supersededBy = engineSupersedesMap["superseded_by"][engine];
  const supersedes = engineSupersedesMap["supersedes"][engine];

  console.log(
    "engine: %s, superseded_by: %s, supersedes: %s",
    engine,
    supersededBy,
    supersedes,
  );

  return (
    <div>
      <HelpCardContainer p={2} {...props}>
        <IconContainer
          align="center"
          justify="center"
          className="flex-no-shrink circular"
          hasCircle={hasCircle}
          x
        >
          <Icon size={20} name="database" className="text-brand" />
        </IconContainer>
        <CardContent
          flexDirection="column"
          justify="center"
          className="ml2"
          shouldDisplayHelpLink={shouldDisplayHelpLink}
        >
          <div>
            <p className="text-medium m0">
              {t`Need help setting up`} {displayName}?
            </p>
            <ExternalLink href={docsLink} className="text-brand text-bold">
              {t`Our docs can help.`}
            </ExternalLink>
          </div>
          {shouldDisplayHelpLink && (
            <p className="mt2 text-medium m0">
              {jt`Docs weren't enough?`}{" "}
              <ExternalLink
                href={CLOUD_HELP_URL}
                className="text-brand text-bold"
              >
                {t`Write us.`}
              </ExternalLink>
            </p>
          )}
        </CardContent>
      </HelpCardContainer>
      {supersedes && (
        <HelpCardContainer p={2} {...props}>
          <Warnings
            className="mx2 align-self-end text-gold"
            warnings={[t`New driver`]}
            size={20}
          />

          <CardContent
            flexDirection="column"
            justify="center"
            className="ml2"
            shouldDisplayHelpLink={shouldDisplayHelpLink}
          >
            <div>
              <p className="text-medium m0">
                {t`This driver replaces the legacy version, which is called ${
                  allEngines[supersedes]["driver-name"]
                }.
                If you need to use the legacy driver, you can select it now.  Please let us know if you have any issues
                with this new driver.`}
              </p>
            </div>
          </CardContent>
        </HelpCardContainer>
      )}
      {supersededBy && (
        <HelpCardContainer p={2} {...props}>
          <Warnings
            className="mx2 align-self-end text-gold"
            warnings={[t`Driver deprecated`]}
            size={20}
          />

          <CardContent
            flexDirection="column"
            justify="center"
            className="ml2"
            shouldDisplayHelpLink={shouldDisplayHelpLink}
          >
            <div>
              <p className="text-medium m0">
                {t`This driver is a legacy driver, and will eventually be removed from Metabase.  Please use the newer
                version, which is called ${
                  allEngines[supersededBy]["driver-name"]
                }. Please let us know if you have any
                issues with this new driver.`}
              </p>
            </div>
          </CardContent>
        </HelpCardContainer>
      )}
    </div>
  );
}

AddDatabaseHelpCard.propTypes = propTypes;

export default AddDatabaseHelpCard;
