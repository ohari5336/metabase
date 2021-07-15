(ns metabase.query-processor.middleware.viz-settings
  (:require [toucan.db :as db]
            [metabase.models.card :refer [Card]]
            [metabase.query-processor.store :as qp.store]
            [metabase.shared.models.visualization-settings :as mb.viz]
            [medley.core :as m]))

(defn- normalize-field-settings
  [id settings]
  (mb.viz/db->norm-column-settings {(mb.viz/norm->db-column-ref {::mb.viz/field-id id}) settings}))

(defn- update-card-viz-settings
  "For each field, fetch its settings from the QP store, convert the settings into the normalized form
  for visualization settings, and then merge in the card-level column settings."
  [fields column-settings]
  (map (fn [[_ id _]]
         (->> id
              qp.store/field
              :settings
              (#(normalize-field-settings id %))
              (#(m/deep-merge % (select-keys column-settings [{::mb.viz/field-id id}])))))
   fields))

(defn update-viz-settings
  "WIP"
  ;; TODO write docstring
  [qp]
  (fn [query rff context]
    (if (contains? #{:json-download :csv-download :xlsx-download} (-> query :info :context))
      (let [viz-settings            (if-let [card-id (-> query :info :card-id)]
                                      ;; For saved cards, fetch viz settings from DB. Otherwise, viz settings are passed
                                      ;; from the frontend and bundled into the query by the API handler.
                                      (mb.viz/db->norm (db/select-one-field :visualization_settings Card :id card-id))
                                      (-> query :viz-settings))
            column-settings      (::mb.viz/column-settings viz-settings)]
        (if-let [fields (-> query :query :fields)]
          ;; Non-native query
          (let [updated-viz-settings (update-card-viz-settings fields column-settings)]
            (qp query (fn [metadata] (rff (assoc metadata :viz-settings updated-viz-settings))) context))
          ;; Native query
          (let [columns (-> viz-settings :table.columns)
                updated-viz-settings (map (fn [column] (-> column
                                                           :name
                                                           (#(select-keys column-settings [{::mb.viz/column-name %}]))))
                                          columns)]
            (qp query (fn [metadata] (rff (assoc metadata :viz-settings updated-viz-settings))) context))))
      (qp query rff context))))
