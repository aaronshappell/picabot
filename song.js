class Song {
    constructor(info, user, index){
        this.id = info.videoId;
        this.title = info.title;
        this.length = info.lengthSeconds;
        this.user = user;
        this.index = index;
    }
}