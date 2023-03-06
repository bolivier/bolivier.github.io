(ns render
  (:require [hiccup2.core :as h]
            [babashka.fs :as fs]
            [babashka.pods :as pods]))

(pods/load-pod 'retrogradeorbit/bootleg "0.1.9")
(require '[pod.retrogradeorbit.bootleg.utils :as utils])
(require '[pod.retrogradeorbit.bootleg.asciidoc :as adoc])

(defn base-html [{:keys [title] :as opts} & children]
  [:html
   [:head
    [:meta {:charset "utf-8"}]
    [:meta {:http-equiv "x-ua-compatible" :content "ie=edge"}]
    [:link {:rel "stylesheet" :href "/index.css"}]
    [:title (or title "Brandon Olivier")]]
   [:body
    children]])


(def index "public/index.html")

(defn post-link [{:keys [title]}]
  [:li.inline title])

(defn card [title posts]
  [:div.shadow.bg-white.p-4.rounded
   [:h3.text-xl.font-bold.text-secondary.underline title]
   [:ul.align-left
    (for [post posts]
      (post-link post))]])

(def index-page
  (base-html {:title "Brandon Olivier"}

             [:header
              [:h2.text-2xl.text-primary.font-bold "Brandon Olivier"]
              [:section.flex.gap-4.items-center
               [:img {:src "/img/profile-pic.jpg"
                      :class "h-16 rounded-full shadow"
                      :alt "profile"}]
               [:section
                [:p "I live in San Antonio, TX.  I write Javascript for work, and Clojure for fun."]
                [:p "I also like to cook"]]]]

             [:main.grid.grid-cols-2.gap-5
              (card "Clojure"
                    [{:title "post 1"}
                     {:title "post 2"}
                     {:title "post 3"}])]))

(defn render []
  (fs/copy-tree "src/img" "public/img" {:replace-existing true})

  (spit index
        (str "<!DOCTYPE html>"
             (utils/convert-to index-page
                               :html))))

(render)

(utils/convert-to (slurp "src/posts/getting-started-clojure.adoc")
                  :html)
