(function (DP) {
  // The subsystems of the home theater from the code samples. Each call can be logged
  // through `log` (the demo shows these lines in its console). Calling them in the wrong
  // order throws a clear error: that is exactly what the facade hides from the client.
  function createTheater(log) {
    const out = typeof log === 'function' ? log : () => {};
    const s = { lights: 'bright', projector: 'off', sound: 'off', player: 'off', title: null };

    const need = (ok, message) => {
      if (!ok) throw new Error(message);
    };

    const lights = {
      dim() {
        s.lights = 'dim';
        out('lights.dim()');
      },
      bright() {
        s.lights = 'bright';
        out('lights.bright()');
      },
    };
    const projector = {
      on() {
        need(s.lights === 'dim', 'projector.on() needs lights.dim() first');
        s.projector = 'on';
        out('projector.on()');
      },
      off() {
        s.projector = 'off';
        out('projector.off()');
      },
    };
    const sound = {
      on() {
        need(s.projector === 'on', 'sound.on() needs projector.on() first');
        s.sound = 'on';
        out('sound.on()');
      },
      off() {
        s.sound = 'off';
        out('sound.off()');
      },
    };
    const player = {
      on() {
        need(s.sound === 'on', 'player.on() needs sound.on() first');
        s.player = 'on';
        out('player.on()');
      },
      play(title) {
        need(s.player !== 'off', 'player.play() needs player.on() first');
        if (typeof title !== 'string' || title.trim() === '') throw new TypeError('title must be a non-empty string');
        s.player = 'playing';
        s.title = title;
        out(`player.play("${title}")`);
      },
      stop() {
        if (s.player === 'playing') s.player = 'on';
        s.title = null;
        out('player.stop()');
      },
      off() {
        s.player = 'off';
        s.title = null;
        out('player.off()');
      },
    };

    return {
      lights,
      projector,
      sound,
      player,
      state() {
        return { ...s };
      },
      // silent reset used by the demo (not part of the code samples)
      reset() {
        Object.assign(s, { lights: 'bright', projector: 'off', sound: 'off', player: 'off', title: null });
      },
    };
  }

  // HomeTheaterFacade: one simple entry point for the whole sequence.
  function createFacade(theater) {
    if (!theater || !theater.lights || !theater.projector || !theater.sound || !theater.player) {
      throw new TypeError('createFacade() needs a theater with lights, projector, sound and player');
    }
    return {
      watchMovie(title) {
        if (typeof title !== 'string' || title.trim() === '') throw new TypeError('title must be a non-empty string');
        theater.lights.dim();
        theater.projector.on();
        theater.sound.on();
        theater.player.on();
        theater.player.play(title);
      },
      endMovie() {
        theater.player.stop();
        theater.player.off();
        theater.sound.off();
        theater.projector.off();
        theater.lights.bright();
      },
    };
  }

  DP.logic.facade = { createTheater, createFacade };
})(window.DP);
