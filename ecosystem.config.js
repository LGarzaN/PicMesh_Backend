module.exports = {
    apps : [{
      name: 'PicMesh_Backend',
      script: './app.js', // Path to your main app file
      instances:  1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }],
    deploy : {
      production : {
        user : 'ec2-user',
        host : ['3.85.82.230'],
        ref  : 'origin/main',
        repo : 'git@github.com:LGarzaN/PicMesh_Backend.git',
        path : '/var/www/production',
        'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
      }
    }
  };
  