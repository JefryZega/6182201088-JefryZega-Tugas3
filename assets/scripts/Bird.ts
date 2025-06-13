import { _decorator, Animation, AudioSource, Color, color, Component, director, easing, EventTouch, Input, input, instantiate, Label, Node, Prefab, Sprite, tween, UIOpacity, UITransform, Vec3 } from "cc";
import { Background } from "./Background";
import { Pipa } from "./Pipa";
const { ccclass, property } = _decorator;

@ccclass("Bird")
export class Bird extends Component {
  static GAME_UDAH_MULAI: boolean = false;
  private nodeImage: Node;
  private curRotation: number = 0;
  private isLagiTurun: boolean = true;
  private kecepatanBurung: number = 50;
  private defaultKecepatan: number = 250;
  private gravitasi: number = 1000;
  private score: number = 0;

  @property({ type: Node })
  private nodeSekumpulanPipa: Node;

  @property({ type: Node })
  private btnStart: Node;

  @property({ type: Node })
  private nodeTanah: Node;

  @property({ type: Node })
  private nodeLangit: Node;

  @property({ type: Label })
  private labelScore: Label;

  @property({ type: Prefab })
  private prefabLedakkan: Prefab;

  private bestScore: number = 0;

  start() {
    this.nodeImage = this.node.getChildByPath("image_bird");

    // 5 detik pertama invisible [soal 22]
    let opa = this.nodeImage.getComponent(UIOpacity);
    tween(opa).to(5, { opacity: 0 }).to(0.5, { opacity: 255 }).start();

    if (localStorage.getItem("bestScore") != "" && localStorage.getItem("bestScore") != null) {
      this.bestScore = parseInt(localStorage.getItem("bestScore"));
    }
    this.labelScore.string = "" + this.bestScore;
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onTouchStart(event: EventTouch) {
    this.isLagiTurun = false;
    this.kecepatanBurung = this.defaultKecepatan;
    this.nodeImage.getComponents(AudioSource)[2].play();
  }

  clickStart(event, customdata) {
    Bird.GAME_UDAH_MULAI = true;
    this.btnStart.active = false;
    this.btnStart.getComponent(AudioSource).play();
  }

  update(deltaTime: number) {
    if (Bird.GAME_UDAH_MULAI) {
      this.kecepatanBurung -= this.gravitasi * deltaTime;
      if (this.isLagiTurun) {
        this.node.translate(new Vec3(0, this.kecepatanBurung * deltaTime, 0));

        if (this.curRotation > -60) {
          this.curRotation -= 60 * deltaTime;
        }
        this.nodeImage.setRotationFromEuler(new Vec3(0, 0, this.curRotation));
      } else {
        this.node.translate(new Vec3(0, this.kecepatanBurung * deltaTime, 0));

        if (this.curRotation < 60) {
          this.curRotation += 60 * deltaTime;
        }
        this.nodeImage.setRotationFromEuler(new Vec3(0, 0, this.curRotation));
      }

      if (this.isNabrakPipa(this.nodeSekumpulanPipa)) {
        this.nodeImage.getComponent(AudioSource).play();
        let animBirdWhite = this.nodeImage.getComponent(Animation);

        // Nabrak object keluar partikel [soal 12]
        let ledakkan = instantiate(this.prefabLedakkan);
        ledakkan.setParent(this.node.parent);
        ledakkan.setWorldPosition(this.node.worldPosition);

        // Saat gameover saat kejeduk pipa, tambahin fadeinout putih [soal 25]
        animBirdWhite.play("bird_white");
        animBirdWhite.crossFade("bird_white", 0.3);

        alert("gameover");
        Bird.GAME_UDAH_MULAI = false;
        //director.loadScene(director.getScene().name);
      } else if (this.isNabrakTanah(this.nodeTanah)) {
        this.nodeImage.getComponent(AudioSource).play();
        this.nodeImage.getComponent(Animation).play("bird_die");

        let ledakkan = instantiate(this.prefabLedakkan);
        ledakkan.setParent(this.node);
        ledakkan.setWorldPosition(this.node.worldPosition);

        alert("gameover nabrak tanah");
        Bird.GAME_UDAH_MULAI = false;
        director.loadScene(director.getScene().name);
      } else if (this.isNabrakLangit(this.nodeLangit)) {
        this.nodeImage.getComponent(AudioSource).play();
        this.nodeImage.getComponent(Animation).play("bird_die");

        let ledakkan = instantiate(this.prefabLedakkan);
        ledakkan.setParent(this.node);
        ledakkan.setWorldPosition(this.node.worldPosition);

        alert("gameover nabrak langit");
        Bird.GAME_UDAH_MULAI = false;
        director.loadScene(director.getScene().name);
      }

      if (this.isDapatScore(this.nodeSekumpulanPipa) && !this.nodeSekumpulanPipa.getComponent(Pipa).isUdahNambahScore()) {
        this.nodeSekumpulanPipa.getComponent(Pipa).setUdahNambahScore(true);
        this.score++;
        this.labelScore.string = "" + this.score;
        if (this.bestScore < this.score) {
          this.bestScore = this.score;
          localStorage.setItem("bestScore", "" + this.bestScore);
        }

        this.nodeImage.getComponents(AudioSource)[1].play();
      }
    }
  }

  isNabrakPipa(nodeSekumpulanPipa: Node): boolean {
    let pipa1 = nodeSekumpulanPipa.getChildByPath("pipa_1");
    let pipa2 = nodeSekumpulanPipa.getChildByPath("pipa_2");

    let wBird = this.nodeImage.getComponent(UITransform).width;
    let hBird = this.nodeImage.getComponent(UITransform).height;
    let curLeftBird = this.nodeImage.worldPosition.x - wBird / 2;
    let curRightBird = this.nodeImage.worldPosition.x + wBird / 2;
    let curTopBird = this.nodeImage.worldPosition.y + hBird / 2;
    let curBottomBird = this.nodeImage.worldPosition.y - hBird / 2;

    let wPipa1 = pipa1.getComponent(UITransform).width;
    let hPipa1 = pipa1.getComponent(UITransform).height;
    let curLeftPipa1 = pipa1.worldPosition.x - wPipa1 / 2;
    let curRightPipa1 = pipa1.worldPosition.x + wPipa1 / 2;
    let curTopPipa1 = pipa1.worldPosition.y + hPipa1 / 2;
    let curBottomPipa1 = pipa1.worldPosition.y - hPipa1 / 2;

    if (curLeftBird <= curRightPipa1 && curRightBird >= curLeftPipa1 && curTopBird > curBottomPipa1 && curBottomBird < curTopPipa1) {
      return true;
    }

    let wPipa2 = pipa2.getComponent(UITransform).width;
    let hPipa2 = pipa2.getComponent(UITransform).height;
    let curLeftPipa2 = pipa2.worldPosition.x - wPipa2 / 2;
    let curRightPipa2 = pipa2.worldPosition.x + wPipa2 / 2;
    let curTopPipa2 = pipa2.worldPosition.y + hPipa2 / 2;
    let curBottomPipa2 = pipa2.worldPosition.y - hPipa2 / 2;

    if (curLeftBird <= curRightPipa2 && curRightBird >= curLeftPipa2 && curTopBird > curBottomPipa2 && curBottomBird < curTopPipa2) {
      return true;
    }

    return false;
  }

  isDapatScore(nodeSekumpulanPipa: Node): boolean {
    let score_collider = nodeSekumpulanPipa.getChildByPath("score_collider");

    let wBird = this.nodeImage.getComponent(UITransform).width;
    let hBird = this.nodeImage.getComponent(UITransform).height;
    let curLeftBird = this.nodeImage.worldPosition.x - wBird / 2;
    let curRightBird = this.nodeImage.worldPosition.x + wBird / 2;
    let curTopBird = this.nodeImage.worldPosition.y + hBird / 2;
    let curBottomBird = this.nodeImage.worldPosition.y - hBird / 2;

    let wSC = score_collider.getComponent(UITransform).width;
    let hSC = score_collider.getComponent(UITransform).height;
    let curLeftSC = score_collider.worldPosition.x - wSC / 2;
    let curRightSC = score_collider.worldPosition.x + wSC / 2;
    let curTopSC = score_collider.worldPosition.y + hSC / 2;
    let curBottomSC = score_collider.worldPosition.y - hSC / 2;

    if (curLeftBird <= curRightSC && curRightBird >= curLeftSC && curTopBird > curBottomSC && curBottomBird < curTopSC) {
      return true;
    }

    return false;
  }

  isNabrakTanah(nodeTanah: Node): boolean {
    let tanah = nodeTanah.getChildByPath("tanah");
    let hTanah = tanah.getComponent(UITransform).height;
    let bird = this.nodeImage.worldPosition.y;
    if (bird <= hTanah) {
      return true;
    }
    return false;
  }

  isNabrakLangit(nodeLangit: Node): boolean {
    let bird = this.nodeImage.worldPosition.y;
    let langit = this.nodeLangit.worldPosition.y;

    if (bird >= langit) {
      return true;
    }
    return false;
  }
}
