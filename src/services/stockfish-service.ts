
export interface EngineAnalysis {
  depth: number;
  selDepth: number;
  multipv: number;
  score: {
    type: 'cp' | 'mate';
    value: number;
  };
  nodes: number;
  nps: number;
  hashfull: number;
  time: number;
  pv: string;
  bestMove?: string;
}

export class StockfishService {
  private worker: Worker | null = null;
  private onMessageCallbacks: ((msg: string) => void)[] = [];
  private _multiPV: number = 3;

  constructor() {
    this.init();
  }

  private init() {
    // We use a proxy worker to load Stockfish from CDN (avoiding 100MB Git limit)
    this.worker = new Worker('/engines/stockfish-worker.js');
    this.worker.onmessage = (event) => {
      const msg = event.data;
      this.onMessageCallbacks.forEach(callback => callback(msg));
    };

    this.sendCommand('uci');
    // Wait for uciok, then set MultiPV
    this.onMessage((msg) => {
      if (msg === 'uciok') {
        this.sendCommand(`setoption name MultiPV value ${this._multiPV}`);
        this.sendCommand('isready');
      }
    });
  }

  public get multiPV(): number {
    return this._multiPV;
  }

  public setMultiPV(count: number) {
    this._multiPV = Math.max(1, Math.min(count, 5));
    this.sendCommand(`setoption name MultiPV value ${this._multiPV}`);
  }

  public sendCommand(cmd: string) {
    if (this.worker) {
      this.worker.postMessage(cmd);
    }
  }

  public onMessage(callback: (msg: string) => void) {
    this.onMessageCallbacks.push(callback);
  }

  public stop() {
    this.sendCommand('stop');
  }

  public quit() {
    this.sendCommand('quit');
    this.worker?.terminate();
  }

  public analyze(fen: string, depth: number = 20) {
    this.stop();
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${depth}`);
  }

  public parseEval(msg: string): EngineAnalysis | null {
    if (!msg.startsWith('info depth')) return null;
    // Skip info lines without a PV (they are summary/bound lines)
    if (!msg.includes(' pv ')) return null;

    const parts = msg.split(' ');
    const analysis: Partial<EngineAnalysis> = {};

    for (let i = 0; i < parts.length; i++) {
      switch (parts[i]) {
        case 'depth': analysis.depth = parseInt(parts[i + 1]); break;
        case 'seldepth': analysis.selDepth = parseInt(parts[i + 1]); break;
        case 'multipv': analysis.multipv = parseInt(parts[i + 1]); break;
        case 'nodes': analysis.nodes = parseInt(parts[i + 1]); break;
        case 'nps': analysis.nps = parseInt(parts[i + 1]); break;
        case 'hashfull': analysis.hashfull = parseInt(parts[i + 1]); break;
        case 'time': analysis.time = parseInt(parts[i + 1]); break;
        case 'pv': analysis.pv = parts.slice(i + 1).join(' '); break;
        case 'score':
          analysis.score = {
            type: parts[i + 1] as 'cp' | 'mate',
            value: parseInt(parts[i + 2])
          };
          break;
      }
    }

    // Default multipv to 1 if not present (single PV mode)
    if (!analysis.multipv) analysis.multipv = 1;

    return analysis as EngineAnalysis;
  }

  public parseBestMove(msg: string): string | null {
    if (msg.startsWith('bestmove')) {
      return msg.split(' ')[1];
    }
    return null;
  }
}
