import { Application, Container } from "pixi.js";
import Score from "../../../Score/Score";
import TimerBar from "../../../../TimerBar/TimerBar";
import type { Dimensions } from "../../../../../types/2d.utils";
import Board from "../../../../Board/Board";
import type Renderer from "../../../../../Systems/Renderer";
import type ContextManager from "../../../../../Systems/ContextManager";
import AttackIndicator from "../../../../AttackIndicator/AttackIndicator";
import EndlessLogicController from "./EndlessController";
import { calculateAspectRatioFit } from "../../../../../Systems/util";
import TopPanel from "../../../Panels/TopPanel";
import BottomPanel from "../../../Panels/BottomPanel";

const theme = {
  light: { primary: 0xeeeeee, secondary: 0xdddddd },
  dark: { primary: 0x282828, secondary: 0x2f2f2f },
  day: { primary: 0x9adfc3, secondary: 0x92d9be },
  night: { primary: 0x013663, secondary: 0x003059 },
  night2: { primary: 0x013663, secondary: 0x002d53 },
};

const curTheme = theme.night;

export default class EndlessMode {
  container: Container;
  app: Application;
  logicController: EndlessLogicController;
  score: Score;
  timer: TimerBar;
  sceneDims: Dimensions;
  boardDims: Dimensions;
  board: Board;
  renderer: Renderer;
  context: ContextManager;
  world: Container;
  aimAssist: AttackIndicator;
  worldScale: number;
  constructor(app: Application, renderer: Renderer, context: ContextManager) {
    this.context = context;
    this.renderer = renderer;
    this.container = new Container();
    this.app = app;
    this.world = new Container();
    this.sceneDims = {
      width: this.app.view.width / 9,
      height: this.app.view.height / 19.5,
    };

    this.boardDims = { width: 8, height: 14 };
    this.calculateDims();
    this.worldScale = this.sceneDims.width / this.boardDims.width;
    this.score = new Score(this.app);
    this.timer = new TimerBar(
      6000,
      this.sceneDims.width * 0.8,
      this.sceneDims.height / 10 / 2
    );
    this.board = new Board(
      this.boardDims,
      1,
      (x: number, y: number) => {
        this.logicController.checkClear(x, y);
      },
      curTheme.primary,
      curTheme.secondary
    );
    this.logicController = new EndlessLogicController(
      this.boardDims,
      1,
      this.score,
      this.timer,
      this.context,
      { width: this.board.render().width, height: this.board.render().height }
    );
    this.aimAssist = new AttackIndicator(
      1,
      this.world,
      this.worldScale,
      this.logicController.boardData
    );

    this.init();
  }

  init() {
    this.container.name = "ActiveGame";
    // this.container.height = this.app.view.height;
    // this.container.width = this.container.height / (19.5 / 9);
    this.setupScene();
  }

  setupScene() {
    const UI = new Container();
    // UI.scale.set(1);

    const frameData = {
      y: this.board.render().y,
      height: this.board.render().height,
    };
    this.world.scale.set(this.worldScale);
    const worldDims = {
      width: this.boardDims.width * this.worldScale,
      height: this.boardDims.height * this.worldScale,
    };

    UI.addChild(this.timer.render(), this.score.init());
    this.world.addChild(
      this.board.render(),
      this.logicController.render(),
      this.aimAssist.render()
    );
    this.world.y = this.app.view.height / 2 - worldDims.height / 2;
    const topPanel = new TopPanel(
      {
        width: this.sceneDims.width,
        height: this.world.y,
      },
      this.timer.render()
    ).render();

    const bottomPanel = new BottomPanel({
      width: this.sceneDims.width,
      // height: (this.sceneDims.height - this.world.height) / 2,
      height: this.world.y,
    }).render();

    bottomPanel.y = worldDims.height + this.world.y;
    this.container.addChild(topPanel, bottomPanel, this.world, UI);

    // fix timer to bottom
    // this.timer.render().y =
    //   this.world.height +
    //   this.timer.render().height / 1.25 -
    //   (this.sceneDims.height - this.world.height) / 2;
    // this.timer.render().x = this.sceneDims.width / 30;

    // fix score to right of timer
    // this.score.render().y =
    //   this.timer.render().y + this.score.render().height / 4;

    // this.score.getContainer().x =
    //   this.timer.render().x + this.timer.render().width + 10;

    this.renderer.addUpdatable(this.logicController, this.score, this.timer);

    this.container.x = this.app.view.width / 2 - this.container.width / 2;
  }

  destroy() {
    // const ctx = this.app.stage.getChildByName("ActiveGame");
    this.container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });

    this.renderer.popUpdatable();
    this.renderer.popUpdatable();
    this.renderer.popUpdatable();
    // if (ctx) {
    //   this.app.stage.removeChild(ctx);
    // }
  }

  getScore() {
    return this.score.getScore();
  }

  render() {
    return this.container;
  }

  calculateDims() {
    // calculate the aspect ratio that our scene should be based on board dimensions
    // and the y offset for UI. Target dimensions is Iphone aspect ratio.
    const targetAspectRatio = 19.5 / 9;
    this.sceneDims.width = this.boardDims.width * targetAspectRatio;
    this.sceneDims.height = this.boardDims.height * targetAspectRatio + 4;

    // const scalar =
    //   this.sceneDims.width < this.sceneDims.height
    //     ? this.sceneDims.height
    //     : this.sceneDims.width;

    // determine how much bigger the remaining screen is space is
    const scaleY = this.app.view.height / this.sceneDims.height;
    const scaleX = this.app.view.width / this.sceneDims.width;

    // this.sceneDims.width *= scalar;
    // this.sceneDims.height *= scalar;

    this.sceneDims = calculateAspectRatioFit(
      this.sceneDims.width,
      this.sceneDims.height,
      this.app.view.width,
      this.app.view.height
    );
    console.log(this.sceneDims);
    console.log({ width: this.app.view.width, height: this.app.view.height });
  }
}
