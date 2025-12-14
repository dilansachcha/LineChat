/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import entity.Chat;
import entity.User;
import entity.User_Status;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.JDBCType;
import java.text.SimpleDateFormat;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

/**
 *
 * @author USER
 */
@WebServlet(name = "ChatLoadHomeData", urlPatterns = {"/ChatLoadHomeData"})
public class ChatLoadHomeData extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Gson gson = new Gson();

        JsonObject responseJson = new JsonObject();//default json obj used - arraylist ehkt dla read krgn thynne
        responseJson.addProperty("success", false);
        responseJson.addProperty("message", "Unable to process your request");

        try {

            Session session = HibernateUtil.getSessionFactory().openSession();

            String userId = request.getParameter("id");//signin successnn pass krn user obj ekn gnna plwn

            User user = (User) session.get(User.class, Integer.parseInt(userId));//user obj ek gnnw

            User_Status user_Status = (User_Status) session.get(User_Status.class, 1);//get user status = 1 (Online)

            user.setUser_Status(user_Status);//user status ek update krnw
            session.update(user);

            //log una kena hra anik usersl gnnw
            Criteria criteria1 = session.createCriteria(User.class);
            criteria1.add(Restrictions.ne("id", user.getId()));

            List<User> otherUserList = criteria1.list();

            //get other user - one by one
            JsonArray jsonChatArray = new JsonArray();

            for (User otherUser : otherUserList) {//log una kena hra anik aya

                //chat list ekn gnnw - last conversation ek
                Criteria criteria2 = session.createCriteria(Chat.class);//chat table ekt search ekk ghnne
                criteria2.add(
                        Restrictions.or(//from eke log una or to eke log una kena innwd
                                Restrictions.and(
                                        Restrictions.eq("from_user", user),//log una kena ywpu msg - from mama
                                        Restrictions.eq("to_user", otherUser)//log una kenta apu msg - to anika
                                ),
                                Restrictions.and(
                                        Restrictions.eq("from_user", otherUser), //- from anika
                                        Restrictions.eq("to_user", user)//- to mama
                                )
                        )
                );
                criteria2.addOrder(Order.desc("id"));//chat id ekn- gnnw antimta ywpu/apu msg eke idn gnnw
                criteria2.setMaxResults(1);

                //create chat item json(obj) to send frontend data - 
                JsonObject jsonChatItem = new JsonObject();
                jsonChatItem.addProperty("other_user_id", otherUser.getId());
                jsonChatItem.addProperty("other_user_mobile", otherUser.getMobile());
                jsonChatItem.addProperty("other_user_name", otherUser.getFirst_name() + " " + otherUser.getLast_name());
                jsonChatItem.addProperty("other_user_status", otherUser.getUser_Status().getId()); //1 = online, 2 = offline

                //check avatar image
                String serverPath = request.getServletContext().getRealPath("");//signup ekedi dipu wdytma img ek gnnw
                String otherUserAvatarImagePath = serverPath + File.separator + "AvatarImages" + File.separator + otherUser.getMobile() + ".png";
                File otherUserAvatarImageFile = new File(otherUserAvatarImagePath);

                if (otherUserAvatarImageFile.exists()) {
                    //avatar image found
                    jsonChatItem.addProperty("avatar_image_found", true);

                } else {
                    //avatar image not found
                    jsonChatItem.addProperty("avatar_image_found", false);
                    jsonChatItem.addProperty("other_user_avatar_letters", otherUser.getFirst_name().charAt(0) + "" + otherUser.getLast_name().charAt(0));//letters dgnnw

                }

                //get chat list
                List<Chat> dbChatList = criteria2.list();
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy, MM dd hh:mm a");

                if (dbChatList.isEmpty()) {
                    //no chat found - adla denna athre
                    jsonChatItem.addProperty("message", "Let's Start New Conversation");
                    jsonChatItem.addProperty("dateTime", dateFormat.format(user.getRegistered_date_time()));
                    jsonChatItem.addProperty("chat_status_id", 1); //1 = seen, 2 = unseen

                } else {
                    //last chat found
                    jsonChatItem.addProperty("message", dbChatList.get(0).getMessage());
                    jsonChatItem.addProperty("dateTime", dateFormat.format(dbChatList.get(0).getDate_time()));
                    jsonChatItem.addProperty("chat_status_id", dbChatList.get(0).getChat_Status().getId());//1 = seen, 2 = unseen
                }
                //chat list ekn gnnw - last conversation ek

                jsonChatArray.add(jsonChatItem);
                //otherUser.setPassword(null);

            }

            //sending users to display
            responseJson.addProperty("success", true);
            responseJson.addProperty("message", "Success");
            //responseJson.add("user", gson.toJsonTree(user)); //user w ywnne nti nisa oon na
            responseJson.add("jsonChatArray", gson.toJsonTree(jsonChatArray));
            //response.getWriter().write(jsonChatArray);

            session.beginTransaction().commit();
            session.close();

        } catch (Exception e) {

        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJson));
    }

}
