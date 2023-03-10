(ns render
  (:require
   [babashka.fs :as fs]
   [babashka.pods :as pods]))

(pods/load-pod 'retrogradeorbit/bootleg "0.1.9")
(require '[pod.retrogradeorbit.bootleg.utils :as utils])

(defn base-html [{:keys [title] :as opts} & children]
  [:html
   [:head
    [:meta {:charset "utf-8"}]
    [:meta {:http-equiv "x-ua-compatible" :content "ie=edge"}]
    [:link {:rel "stylesheet" :href "/index.css"}]
    [:title (or title "Brandon Olivier")]]
   [:body
    children]])


(def index "resources/public/index.html")

(def index-page
  (base-html
   {:title "Brandon Olivier"}
   [:header
    [:h2.text-2xl.text-primary.font-bold "Brandon Olivier"]
    [:section.flex.gap-4.items-center
     [:img {:src "/img/profile-pic.jpg"
            :class "h-16 rounded-full shadow"
            :alt "profile"}]
     [:section
      [:p "I live in San Antonio, TX.  I write Javascript for work, and Clojure for fun."]
      [:p "I also like to cook"]]]]))

(defn render []
  (spit index
        (str "<!DOCTYPE html>"
             (utils/convert-to index-page :html))))

(render)
