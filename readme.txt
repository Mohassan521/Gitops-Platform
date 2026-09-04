Jab hum application ka naya code GitHub par push karte hain, to hamari CI pipeline, jo GitHub Actions 
me configured hai, automatically trigger hoti hai. GitHub Actions us naye code se Docker image build 
karti hai aur image ko latest jaisa reusable tag dene ke bajaye us specific Git commit ki SHA ko 
image tag bana deti hai, taake har image ko exact source-code version se trace kiya ja sake. Ye 
image phir GHCR (GitHub Container Registry) me push ho jati hai. Image successfully push hone ke 
baad GitHub Actions hamari Helm values.yaml file me purani image SHA ko replace karke nayi image ki 
SHA likhti hai aur is change ko automatically Git repository me commit aur push karti hai; isi ko 
hum bot commit keh rahe hain. Ab Git repository hamare cluster ki desired state represent karti hai. 
ArgoCD Git repository ko monitor karta hai, aur jaise hi usse values.yaml me naya image tag nazar 
aata hai, woh Git/Helm configuration ko K3s cluster ki current state se compare karta hai. Auto-sync 
enabled hone par ArgoCD Helm chart ke through Kubernetes deployment update karta hai, jisse purane 
Pods gradually replace hoke nayi SHA wali Docker image ke Pods run karne lagte hain. Is tarah 
developer ko manually server par jaa kar deployment command chalane ki zaroorat nahi hoti—Git me jo 
desired state hai, ArgoCD cluster ko us state tak le aata hai.