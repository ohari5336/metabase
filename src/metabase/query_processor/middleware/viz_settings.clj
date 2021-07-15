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
              (#(m/deep-merge % (select-keys column-settings {::mb.viz/field-id id})))))
   fields))

(defn update-viz-settings
  [qp]
  (fn [query rff context]
    (if (contains? #{:json-download :csv-download :xlsx-download} (-> query :info :context))
      (let [viz-settings            (if-let [card-id (-> query :info :card-id)]
                                      ;; For saved cards, fetch viz settings from DB. Otherwise, viz settings are passed
                                      ;; from the frontend and bundled into the query by the API handler.
                                      (mb.viz/db->norm (db/select-one-field :visualization_settings Card :id card-id))
                                      (-> query :viz-settings))]
        (if-let [fields (-> query :query :fields)]
          (let [column-settings      (::mb.viz/column-settings viz-settings)
                updated-viz-settings (update-card-viz-settings fields column-settings)]
            (def my-updated-viz-settings updated-viz-settings)
            (comment (clojure.pprint/pprint my-updated-viz-settings))
            (qp query (fn [metadata] (rff (assoc metadata :viz-settings updated-viz-settings))) context))
          ;; Native query
          (let [column-names (-> viz-settings :table.columns)]
            ;; (-> viz-settings :table.columns) contains names of cols in order
            ;; Iterate over these and look up viz settings in column-settings
            (qp query rff context)))
        (qp query (fn [metadata] (rff (assoc metadata :viz-settings viz-settings))) context))
      (qp query rff context))))
