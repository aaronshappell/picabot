class Song {
    constructor(info, user){
        this.id = info.videoId;
        this.title = info.title;
        this.length = info.lengthSeconds;
        this.user = user;
    }
}