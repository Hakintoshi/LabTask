"use strict";
let users = [];
let modalIsOpen = false;
let copyUsers = null;

const table = document.querySelector("tbody");
const searchField = document.querySelector(".search-form__field");

async function getUsers() {
  try {
    const response = await fetch(
      "https://5ebbb8e5f2cfeb001697d05c.mockapi.io/users"
    );
    const data = await response.json();
    users = data;
    return data;
  } catch (e) {
    console.log(e);
  }
}

// Поле для поиска 

searchField.addEventListener("input", (e) => {
  if (modalIsOpen) return;
  let searchText = e.target.value 
  if (e.target.value.length) {
    cleanFilter.style.display = "flex";
  } else {
    if ( !filters[0].classList.contains("active-param") && !filters[1].classList.contains("active-param")) {
      cleanFilter.style.display = "none";
    }
  }
  copyUsers = users.filter( (user) =>   
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||  
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );
  setUsers(copyUsers);
});

// Очищение фильтра

const cleanFilter = document.querySelector(".clean-filter");

cleanFilter.addEventListener("click", () => {
  searchField.value = "";
  cleanFilter.style.display = "none";
  copyUsers = null;
  // Перевод флагов для фильторв
  sortByDate = true;
  sortByRating = true;
  filters.forEach(filter => filter.classList.remove("active-param"));
  setUsers(users);
});

// Фильтры

const filters = document.querySelectorAll(".sorting__param");

// флаг для смены сортировки(по возрастнанию = true, по убыванию = false)
let sortByDate = true;
// флаг для смены сортировки(по возрастнанию = true, по убыванию = false)
let sortByRating = true;

const switchActive = (numFilterFirst, numFilterSecond) => {
    filters[numFilterFirst].classList.remove("active-param");
    filters[numFilterSecond].classList.add("active-param");
    cleanFilter.style.display = "flex";
}

filters[0].addEventListener("click", () => {
  if (modalIsOpen) return;
  const searchField = document.querySelector(".search-form__field");
  if (searchField.value.length) {
    if (!copyUsers.length) return;
  }
  switchActive(1,0)
  sortByDate = !sortByDate;
  sortByRating = true;
  let sortedUsers;
  if (copyUsers) {
    sortedUsers = sortUsers(copyUsers, "registration_date", sortByDate);
    setUsers(sortedUsers);
  } else {
    sortedUsers = sortUsers(users, "registration_date", sortByDate);
    setUsers(sortedUsers);
  }
});

filters[1].addEventListener("click", () => {
  if (modalIsOpen) return;
  const searchField = document.querySelector(".search-form__field");
  if (searchField.value.length) {
    if (!copyUsers.length) return;
  }
  switchActive(0,1)
  sortByRating = !sortByRating;
  sortByDate = true;
  let sortedUsers;
  if (copyUsers) {
    sortedUsers = sortUsers(copyUsers, "rating", sortByRating);
    setUsers(sortedUsers);
  } else {
    sortedUsers = sortUsers(users, "rating", sortByRating);
    setUsers(sortedUsers);
  }
});

/**
 * Сортировка пользователей.
 * 
 * @param {array} users список пользователей.
 * @param {string} userParam параметр из характеристик пользователей.
 * @param {boolean} sortAscending сортировка по возростанию.
 * @returns {array} список отсортированных пользователей.
 */

const sortUsers = (users, userParam, sortAscending) => {
  if (userParam === "registration_date") {
    users = sortAscending
      ? [...users].sort(
          (a, b) => new Date(a[userParam]) - new Date(b[userParam])
        )
      : [...users].sort(
          (a, b) => new Date(b[userParam]) - new Date(a[userParam])
        );
    return users;
  } else {
    users = sortAscending
      ? [...users].sort((a, b) => a[userParam] - b[userParam])
      : [...users].sort((a, b) => b[userParam] - a[userParam]);
    return users;
  }
};

// Создание таблицы для отображения пользовтелей

const createTable = (users) => {

  for (let i = 0; i < users.length; i++) {
    let tr = document.createElement("tr");
    let closeTd = document.createElement("td");

    closeTd.addEventListener("click", () => {
      const modal = document.querySelector(".modal");
      const tds = document.querySelectorAll("td");
      searchField.classList.add("hideFocus");
      tds.forEach((td) => (td.style.filter = "blur(3px)"));
      modalIsOpen = true;
      table.classList.add("blur");
      modal.style.visibility = "visible";

      const hideModal = () => {
        modalIsOpen = false;
        modal.style.visibility = "hidden";
        searchField.classList.remove("hideFocus");
        table.classList.remove("blur");
        tds.forEach((td) => (td.style.filter = "none"));
        btnsModal[0].removeEventListener("click", confirm);
      };

      const confirm = () => {
        hideModal();

        if (users.length === 1) {
          deleteUser(users[i].id, -1);
        } else {
          deleteUser(users[i].id);
        }
      };

      const btnsModal = document.querySelectorAll(".modal__btns-modal-btn");
      btnsModal[0].addEventListener("click", confirm);
      btnsModal[1].addEventListener("click", hideModal);
    });
    closeTd.innerHTML = '<img src="./icons/cancel.svg"  alt="Иконка для закрытия">';
    closeTd.style.cursor = "pointer";

    for (let key in users[i]) {
      let td = document.createElement("td");
      if (key === "id") {
        continue;
      } else if (key === "registration_date") {
        const date = new Date(users[i][key]);
        let formattedDate = [
          addLeadZero(date.getDate()),
          addLeadZero(date.getMonth() + 1),
          date.getFullYear(),
        ].join(".");

        function addLeadZero(val) {
          if (+val < 10) return "0" + val;
          return val;
        }

        td.textContent = formattedDate;
      } else {
        td.textContent = users[i][key];
      }

      tr.append(td);
      tr.append(closeTd);
    }

    table.append(tr);
  }
};

/**
 * формирует пагинацию.
 * 
 * @param {array} users 
 * @param {number} start 
 * @param {number} end 
 * @param {number} currPage 
 * @returns 
 */

const pagination = (users, start, end, currPage = 0) => {
  const listPagination = document.querySelector(".list-pagination");
  let countPage = Math.ceil(users.length / 5);

  listPagination.replaceChildren();
  for (let i = 1; i <= countPage; i++) {
    const page = document.createElement("button");
    page.textContent = i;
    page.classList.add("list-pagination__btn");
    listPagination.append(page);
  }
  let usersCopy = [...users];

  let paginationBtns = document.querySelectorAll(".list-pagination__btn");

  const setBtn = (btns) => {
    if (currPage !== undefined && currPage !== 0) {
      btns[currPage - 1].classList.add("pagination-btn-active");
    } else {
      btns[currPage].classList.add("pagination-btn-active");
    }

    for (let paginationBtn of btns) {
      paginationBtn.addEventListener("click", () => {
        if (modalIsOpen) return;
        paginationBtns.forEach((el) => {
          el.classList.remove("pagination-btn-active");
        });
        paginationBtn.classList.add("pagination-btn-active");
        let allTr = document.querySelectorAll("tr");
        for (let i = 0; i < allTr.length; i++) {
          if (i >= 1) {
            allTr[i].remove();
          }
        }
        end = paginationBtn.innerHTML * 5;
        start = end - 5;
        users = usersCopy.slice(start, end);
        createTable(users);
      });
    }
  };
  setBtn(paginationBtns);
  return users.slice(start, end);
};


const deleteUser = (id, onPrev) => {
  let paginationBtns = document.querySelectorAll(".list-pagination__btn");
  let currPage = null;
  let start = null;
  let end = null;
  if (onPrev) {
    currPage = -1;
  }
  for (let el of paginationBtns) {
    if (el.classList.contains("pagination-btn-active")) {
      currPage += +el.innerHTML;
    }
  }
  end = currPage * 5;
  start = end - 5;
  if (copyUsers) {
    copyUsers = copyUsers.filter((user) => user.id !== id);
    users = users.filter((user) => user.id !== id);
    setUsers(copyUsers, start, end, currPage);
  } else {
    users = users.filter((user) => user.id !== id);
    setUsers(users, start, end, currPage);
  }
};

const setUsers = async (filterUsers, start = 0, end = 5, currPage = 0) => {
  let users = [];
  const listPagination = document.querySelector(".list-pagination");
  if (filterUsers) {
    users = filterUsers;
    let allTr = document.querySelectorAll("tr");
    for (let i = 0; i < allTr.length; i++) {
      if (i >= 1) {
        allTr[i].style.display = "none";
      }
    }
  } else {
    users = await getUsers();
  }

  if (users.length > 5) {
    users = pagination(users, start, end, currPage);
    listPagination.style.visibility = "visible";
    createTable(users);
  } else {
    listPagination.style.visibility = "hidden";
    createTable(users);
  }

  if (users.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.classList.add("tr-info");
    td.textContent = "Пользователи не найдены";
    td.setAttribute("colspan", 5);
    tr.append(td);
    table.append(tr);
  }
};

setUsers();
