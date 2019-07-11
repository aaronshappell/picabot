class Song {
    constructor(info, user){
        this.id = info.video_id;
        this.title = info.title;
        this.length = info.length_seconds;
        this.user = user;
    }
}

module.exports = Song;