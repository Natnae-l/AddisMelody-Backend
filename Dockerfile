FROM node:alpine3.20

WORKDIR /usr/app

COPY . .

ENV PORT=3000 \
    MONGO_URL="mongodb+srv://Natnael:e840qPAaOMYxgeSC@cluster0.vs0kmkg.mongodb.net/addis-melody?retryWrites=true&w=majority&appName=Cluster0" \
    SERVER_URL="https://addismelody-backend.onrender.com" \
    JWT_SECRET="N*23&#defreF"

RUN npm install

RUN npx tsc

EXPOSE 3000

CMD [ "node", "dist/app.js" ]

