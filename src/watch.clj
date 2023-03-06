(require '[babashka.pods :as pods])

(pods/load-pod 'org.babashka/filewatcher "0.0.1")

(require '[pod.babashka.filewatcher :as fw])

(fw/watch "src/posts"
          (fn [_]
            (println "Re-rendering")
            (load-file "render.clj")))

(fw/watch "src/render.clj"
          (fn [_]
            (println "Re-rendering")
            (load-file "render.clj")))

(fw/watch "src/templates"
          (fn [_]
            (println "Re-rendering")
            (load-file "render.clj")))

@(promise)
