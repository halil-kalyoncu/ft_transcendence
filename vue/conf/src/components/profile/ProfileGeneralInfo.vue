<template>
  <section class="general-info">
    <div class="profile-section">
      <img class="profile-image" src="../../assets/avatar-1.png" alt="Profile" />
      <span class="header-username profile-username">Username</span>
    </div>
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-number">3</span>
        <span class="stat-text stat-wins">Victories</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">1</span>
        <span class="stat-text stat-losses">Defeats</span>
      </div>
    </div>
  </section>
</template>

<style>
.general-info {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-bottom: 0.1px solid darkgray;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.profile-section {
  display: flex;
  align-items: center;
}

.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.profile-username {
  font-size: 1.5rem;
  font-family: 'Gill Sans', sans-serif;
  text-transform: uppercase;
  margin-left: 1rem;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  width: 325px;
  padding: 0.25rem 0;
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 3.5rem;
  color: aliceblue;
  font-family: 'Gill Sans', sans-serif;
}

.stat-text {
  font-size: 1.5rem;
  font-family: 'Gill Sans', sans-serif;
  text-transform: uppercase;
}

.stat-wins {
  color: green;
}

.stat-losses {
  color: #e2411f;
}
</style>
